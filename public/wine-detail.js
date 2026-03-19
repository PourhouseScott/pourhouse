function readSlugFromPath() {
  const pathSegments = window.location.pathname.split("/").filter(Boolean);
  return decodeURIComponent(pathSegments[pathSegments.length - 1] || "");
}

function currency(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD"
  }).format(value);
}

function summarizePrices(inventoryRows) {
  const prices = inventoryRows.filter((row) => row && row.isAvailable);

  const glassCandidates = prices
    .map((row) => Number(row.priceGlass))
    .filter((price) => Number.isFinite(price) && price > 0);
  const bottleCandidates = prices
    .map((row) => Number(row.priceBottle))
    .filter((price) => Number.isFinite(price) && price > 0);

  return {
    glass: glassCandidates.length > 0 ? Math.min(...glassCandidates) : null,
    bottle: bottleCandidates.length > 0 ? Math.min(...bottleCandidates) : null
  };
}

function renderError(message) {
  const root = document.getElementById("wine-detail-root");
  if (!root) {
    return;
  }

  root.innerHTML = `
    <section class="card card--error">
      <p class="eyebrow">Pourhouse Wine Co.</p>
      <h1>We could not load this wine</h1>
      <p class="description">${message}</p>
      <p class="tip">Confirm the URL slug or scan a fresh QR code.</p>
    </section>
  `;
}

function renderWineDetail(wine) {
  const root = document.getElementById("wine-detail-root");
  if (!root) {
    return;
  }

  const prices = summarizePrices(Array.isArray(wine.inventory) ? wine.inventory : []);

  root.innerHTML = `
    <article class="card">
      <p class="eyebrow">Pourhouse Wine Co.</p>
      <h1>${wine.name}</h1>
      <p class="description">${wine.description || "Description coming soon."}</p>
      <section class="meta">
        <div class="meta-item">
          <p class="meta-label">By the glass</p>
          <p class="meta-value meta-value--price">${currency(prices.glass)}</p>
        </div>
        <div class="meta-item">
          <p class="meta-label">By the bottle</p>
          <p class="meta-value meta-value--price">${currency(prices.bottle)}</p>
        </div>
      </section>
    </article>
  `;
}

async function loadWineBySlug() {
  const slug = readSlugFromPath();

  if (!slug) {
    renderError("Missing wine slug in URL.");
    return;
  }

  try {
    const response = await fetch(`/api/wines/${encodeURIComponent(slug)}`);

    if (!response.ok) {
      if (response.status === 404) {
        renderError("This wine could not be found.");
        return;
      }

      throw new Error(`Request failed with status ${response.status}`);
    }

    const wine = await response.json();
    renderWineDetail(wine);
  } catch {
    renderError("There was a problem loading this page. Please try again shortly.");
  }
}

void loadWineBySlug();
