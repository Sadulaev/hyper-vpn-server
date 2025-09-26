type ServersLoads = {[key: string]: { [key: string]: number}[]}

export async function getServersLoads(): Promise<ServersLoads> {
  try {
    const url = 'http://0.0.0.0:5000/loads';

    const res = await fetch(url)

    const data: unknown = await res.json();

    return data as ServersLoads;
  } catch (err) {
    console.log(err);
  }
}