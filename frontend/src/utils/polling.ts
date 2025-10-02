// utils/polling.ts
export const pollProgress = async (
  url: string,
  token: string,
  onUpdate: (data: any) => void,
  onComplete: () => void
) => {
  const interval = setInterval(async () => {
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${JSON.parse(token)}` },
      });
      const data = await res.json();
      if (data.success) {
        onUpdate(data);
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
          onComplete();
        }
      } else {
        clearInterval(interval);
      }
    } catch {
      clearInterval(interval);
    }
  }, 3000);
};
