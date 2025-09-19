export async function getVlessKey(period: number): Promise<string> {
  try {
    const url = 'http://0.0.0.0:5000/get-key';

    const res = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: JSON.stringify({ period })
    })

    const data: unknown = await res.json();
    const key = (data as any)?.vless;

    return key;
  } catch (err) {
    console.log(err);
  }
}