import { FormUpload } from '@/pages/Form';
import { useSession } from '@/hooks/useSession';

export default function FormUploadWrapper() {
    const { session } = useSession();
    if (!session) return null;
    return <FormUpload {...session} />;
}