import { CampaignShipping, ContactList, Whatsapp } from '@prisma/client'

export type CampaignWithContacts = {
  id: number;
  name: string;
  contactList: ContactList | null;
  whatsapp: Whatsapp | null;
  shipping: CampaignShipping[];
}