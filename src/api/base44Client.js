import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, serverUrl, token, functionsVersion } = appParams;

//Create a client with authentication required
export const base44 = createClient({
  appId,
  serverUrl,
  // O login é servido pelo Base44; o frontend hospedado no VPS não tem /login.
  appBaseUrl: 'https://loja-cavaleiros-da-paz.base44.app',
  token,
  functionsVersion,
  requiresAuth: false
});
