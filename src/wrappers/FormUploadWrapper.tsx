import { FormUpload } from '@/pages/Form';
import { useSession } from '@/hooks';

export function FormUploadWrapper() {
    const { session } = useSession();
    if (!session) return null;
    return <FormUpload {...session} />;
}