function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function queryBoolean(value) {
  if (value === null) {
    return false
  }

  return value === "1" || value.toLowerCase() === "true"
}

function getEmbedOptions() {
  const params = new URLSearchParams(window.location.search)

  return {
    compact: queryBoolean(params.get("compact")),
    apiBase: (params.get("apiBase") || "").trim()
  }
}

function endpointFromBase(apiBase) {
  if (!apiBase) {
    return "/api/wines/grouped"
  }

  return `${apiBase.replace(/\/$/, "")}/api/wines/grouped`
}

function renderError(message) {
  const root = document.getElementById("wine-list-embed-root")
  if (!root) {
    return
  }

  root.innerHTML = `
    <section class="state-card state-card--error">
      <p class="state-kicker">Pourhouse</p>
      <h1>Unable to load wine list</h1>
      <p>${escapeHtml(message)}</p>
    </section>
  `
}

function badges(wine) {
  const items = []

  if (wine.availableByGlass) {
    items.push("<span class=\"badge badge--glass\">By the Glass</span>")
  }

  if (wine.availableByBottle) {
    items.push("<span class=\"badge badge--bottle\">Bottle Pour</span>")
  }

  if (wine.availableForFlight) {
    items.push("<span class=\"badge badge--flight\">Flight Featured</span>")
  }

  if (items.length === 0) {
    items.push("<span class=\"badge badge--out\">Temporarily Unavailable</span>")
  }

  return items.join("")
}

function renderGroupedList(payload, options) {
  const root = document.getElementById("wine-list-embed-root")
  if (!root) {
    return
  }

  const groups = Array.isArray(payload.groups) ? payload.groups : []

  if (groups.length === 0) {
    root.innerHTML = `
      <section class="state-card">
        <p class="state-kicker">Pourhouse</p>
        <h1>No wines published yet</h1>
        <p>Check back shortly for the latest list.</p>
      </section>
    `

    return
  }

  root.dataset.compact = options.compact ? "true" : "false"

  const hero = options.compact
    ? ""
    : `
      <section class=\"hero\">
        <p class=\"kicker\">Pourhouse Wine Co.</p>
        <h1>Current Wine List</h1>
        <p class=\"subtitle\">Explore our pours by style and region.</p>
      </section>
    `

  const groupsMarkup = groups
    .map((group, groupIndex) => {
      const regions = Array.isArray(group.regions) ? group.regions : []

      const regionsMarkup = regions
        .map((region) => {
          const wines = Array.isArray(region.wines) ? region.wines : []

          const winesMarkup = wines
            .map((wine) => `
              <article class=\"wine-card\">
                <h4 class=\"wine-title\">${escapeHtml(wine.name)} ${escapeHtml(wine.vintage)}</h4>
                <p class=\"wine-meta\">${escapeHtml(wine.winery.name)} · ${escapeHtml(wine.country)}</p>
                <div class=\"badges\">${badges(wine)}</div>
              </article>
            `)
            .join("")

          return `
            <section class=\"region\">
              <h3>${escapeHtml(region.name)}</h3>
              <div class=\"wine-grid\">${winesMarkup}</div>
            </section>
          `
        })
        .join("")

      return `
        <article class=\"type-block\" style=\"animation-delay:${groupIndex * 60}ms\">
          <header class=\"type-head\">
            <h2>${escapeHtml(group.type)}</h2>
          </header>
          ${regionsMarkup}
        </article>
      `
    })
    .join("")

  root.innerHTML = `${hero}<section class=\"groups\">${groupsMarkup}</section>`
}

async function loadEmbeddedWineList() {
  const options = getEmbedOptions()

  try {
    const response = await fetch(endpointFromBase(options.apiBase))

    if (!response.ok) {
      throw new Error(`Request failed (${response.status})`)
    }

    const payload = await response.json()
    renderGroupedList(payload, options)
  } catch {
    renderError("Please try again in a moment.")
  }
}

void loadEmbeddedWineList()
