import { redirect } from 'next/navigation';

// Old /admin route — redirect to the proper organizer dashboard
export default function AdminPage() {
  redirect('/organizer/dashboard/buildwithai-lagos-26');
}
