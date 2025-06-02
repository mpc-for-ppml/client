import { FormUpload } from '@/pages/Form';
import { useSession } from '@/hooks';
import { FormUpload2 } from '@/pages';

export function FormUploadWrapper() {
    const { session } = useSession();
    if (!session) return null;
    return <FormUpload {...session} />;
}

export function FormUploadWrapper2() {
    const { session } = useSession();
    if (!session) return null;
    return <FormUpload2 {...session} />;
}