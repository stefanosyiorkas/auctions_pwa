export async function fetchBidsForAuction(auctionId) {
  const res = await fetch(`/api/auctions/${auctionId}/bids`);
  if (!res.ok) throw new Error("Failed to fetch bids");
  return await res.json();
}
