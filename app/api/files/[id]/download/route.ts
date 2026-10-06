import { NextResponse, type NextRequest } from 'next/server'
import * as z from 'zod'
import { logActivity } from '@/features/activity/log'
import { STORAGE_BUCKET } from '@/features/files/constants'
import { versionedFileName } from '@/features/files/utils'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/files/:id/download?version=N&mode=view
 * Redirects to a short-lived signed URL. Access is enforced by RLS on
 * files/file_versions and by the storage policies.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!z.uuid().safeParse(id).success) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: file } = await supabase
    .from('files')
    .select('id, file_name, current_version')
    .eq('id', id)
    .maybeSingle()
  if (!file) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const searchParams = request.nextUrl.searchParams
  const requested = Number.parseInt(searchParams.get('version') ?? '', 10)
  const versionNumber = Number.isInteger(requested) && requested > 0 ? requested : file.current_version

  const { data: version } = await supabase
    .from('file_versions')
    .select('storage_path, version_number')
    .eq('file_id', id)
    .eq('version_number', versionNumber)
    .maybeSingle()
  if (!version) {
    return NextResponse.json({ error: 'Version not found' }, { status: 404 })
  }

  const inline = searchParams.get('mode') === 'view'
  const downloadName =
    version.version_number === file.current_version
      ? file.file_name
      : versionedFileName(file.file_name, version.version_number)

  const { data: signed, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .createSignedUrl(version.storage_path, 60, { download: inline ? false : downloadName })
  if (error || !signed) {
    return NextResponse.json({ error: 'Could not create download link' }, { status: 500 })
  }

  if (!inline) {
    await logActivity(supabase, user.id, 'download', file.id, {
      file_name: file.file_name,
      version: version.version_number,
    })
  }

  return NextResponse.redirect(signed.signedUrl)
}
