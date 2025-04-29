const API_URL = process.env.EXPO_PUBLIC_API_URL;

async function createChat() {
  console.log(API_URL + '/chats')
  const res = await fetch(API_URL + '/chats', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  const data = await res.json();
  console.log
  if (!res.ok) {
    return Promise.reject({ status: res.status, data });
  }

  return data;
}

export default {
  createChat,
};
