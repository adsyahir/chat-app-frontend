import { authenticatedServerFetch } from "@/lib/api";
import Contacts from "@/components/contact";
const getListOfContacts = async () => {
  try {
    const users = await authenticatedServerFetch(
      `http://localhost:8000/api/friends/get-friends`
    );
    return users;
  } catch (error) {
    console.error("Error fetching pending friend requests:", error);
    return [];
  }
};
export default async function ContactsPage() {
  const contacts = await getListOfContacts();

 console.log(contacts);
  return <Contacts contacts={contacts} />;
}
