// JavaScript demo — a small async utility
const retry = async (fn, attempts = 3, delay = 250) => {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === attempts - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

const fetchJson = (url) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });

export { retry, fetchJson };