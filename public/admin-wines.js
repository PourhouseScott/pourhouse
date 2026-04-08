/* global document, window, HTMLElement */

const STORAGE_KEY = "pourhouse.adminJwt"

const state = {
  token: "",
  userEmail: "",
  wines: [],
  filteredWines: [],
  regions: [],
  wineries: [],
  selectedWineId: "",
  loading: false
}

const elements = {
  signInButton: document.getElementById("google-signin"),
  signOutButton: document.getElementById("signout"),
  status: document.getElementById("admin-status"),
  editorTitle: document.getElementById("editor-title"),
  wineForm: document.getElementById("wine-form"),
  wineId: document.getElementById("wine-id"),
  wineryId: document.getElementById("wineryId"),
  regionId: document.getElementById("regionId"),
  deleteButton: document.getElementById("delete-wine"),
  resetEditor: document.getElementById("reset-editor"),
  refreshWines: document.getElementById("refresh-wines"),
  wineList: document.getElementById("wine-list"),
  wineSearch: document.getElementById("wine-search")
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function setStatus(message, tone = "neutral") {
  if (!elements.status) {
    return
  }

  elements.status.textContent = message
  elements.status.classList.remove("is-error", "is-success")

  if (tone === "error") {
    elements.status.classList.add("is-error")
  }

  if (tone === "success") {
    elements.status.classList.add("is-success")
  }
}

function decodeTokenPayload(token) {
  const tokenParts = String(token || "").split(".")
  if (tokenParts.length < 2) {
    return null
  }

  try {
    const base64 = tokenParts[1].replace(/-/g, "+").replace(/_/g, "/")
    const decoded = window.atob(base64)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

function setAuthUiState() {
  if (elements.signInButton) {
    elements.signInButton.disabled = Boolean(state.token)
  }

  if (elements.signOutButton) {
    elements.signOutButton.disabled = !state.token
  }
}

function persistSession(token) {
  state.token = token
  const payload = decodeTokenPayload(token)
  state.userEmail = typeof payload?.email === "string" ? payload.email : ""
  window.localStorage.setItem(STORAGE_KEY, token)
  setAuthUiState()
}

function clearSession() {
  state.token = ""
  state.userEmail = ""
  window.localStorage.removeItem(STORAGE_KEY)
  setAuthUiState()
}

function sanitizePath(pathValue) {
  const value = String(pathValue || "").trim()
  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/admin/wines"
  }

  return value
}

function removeAuthQueryFlags() {
  const nextUrl = new URL(window.location.href)
  nextUrl.searchParams.delete("authError")
  window.history.replaceState({}, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`)
}

function initializeAuthFromUrl() {
  const currentUrl = new URL(window.location.href)
  const hashParams = new URLSearchParams(currentUrl.hash.replace(/^#/, ""))
  const tokenFromHash = hashParams.get("token")

  if (tokenFromHash) {
    persistSession(tokenFromHash)
    currentUrl.hash = ""
    window.history.replaceState({}, "", `${currentUrl.pathname}${currentUrl.search}`)
    return { hadTokenInHash: true }
  }

  const authError = currentUrl.searchParams.get("authError")
  if (authError === "missing_code") {
    setStatus("Google sign-in did not return an authorization code. Try again.", "error")
    removeAuthQueryFlags()
  } else if (authError === "google_auth_failed") {
    setStatus("Google sign-in failed. Please try again.", "error")
    removeAuthQueryFlags()
  }

  return { hadTokenInHash: false }
}

function setLoading(isLoading) {
  state.loading = isLoading

  if (elements.refreshWines) {
    elements.refreshWines.disabled = isLoading
  }

  if (elements.deleteButton) {
    elements.deleteButton.disabled = isLoading || !state.selectedWineId
  }

  const submitButton = document.getElementById("save-wine")
  if (submitButton) {
    submitButton.disabled = isLoading
  }
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${state.token}`
  }
}

function renderSelectOptions(selectElement, rows, placeholder) {
  if (!selectElement) {
    return
  }

  const options = [`<option value="">${escapeHtml(placeholder)}</option>`]

  rows.forEach((row) => {
    options.push(`<option value="${escapeHtml(row.id)}">${escapeHtml(row.name)}</option>`)
  })

  selectElement.innerHTML = options.join("")
}

function applySearchFilter() {
  const query = (elements.wineSearch?.value || "").trim().toLowerCase()

  if (!query) {
    state.filteredWines = [...state.wines]
  } else {
    state.filteredWines = state.wines.filter((wine) => {
      const haystack = [
        wine.name,
        wine.country,
        wine.winery?.name,
        wine.region?.name,
        Array.isArray(wine.grapeVarieties) ? wine.grapeVarieties.join(" ") : ""
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(query)
    })
  }

  renderWineList()
}

function renderWineList() {
  if (!elements.wineList) {
    return
  }

  if (!state.token) {
    elements.wineList.innerHTML = '<p class="empty-state">Sign in with Google to load the admin workspace.</p>'
    return
  }

  if (state.filteredWines.length === 0) {
    elements.wineList.innerHTML = '<p class="empty-state">No wines match the current filter.</p>'
    return
  }

  elements.wineList.innerHTML = state.filteredWines
    .map((wine) => {
      const isSelected = wine.id === state.selectedWineId
      const grapes = Array.isArray(wine.grapeVarieties) ? wine.grapeVarieties : []

      return `
        <article class="wine-card${isSelected ? " is-selected" : ""}" data-wine-id="${escapeHtml(wine.id)}">
          <div class="wine-card__header">
            <div>
              <p class="eyebrow">${escapeHtml(wine.winery?.name || "Unknown winery")}</p>
              <h3 class="wine-card__title">${escapeHtml(wine.name)}</h3>
              <p class="wine-card__subhead">${escapeHtml(String(wine.vintage))} · ${escapeHtml(wine.region?.name || "Unknown region")} · ${escapeHtml(wine.country || "Unknown country")}</p>
            </div>
            <div class="card-actions">
              <button type="button" class="button button--ghost" data-action="edit" data-wine-id="${escapeHtml(wine.id)}">Edit</button>
              <button type="button" class="button button--ghost" data-action="delete" data-wine-id="${escapeHtml(wine.id)}">Delete</button>
            </div>
          </div>
          <p class="wine-card__description">${escapeHtml(wine.description || "No description yet.")}</p>
          <div class="wine-card__meta">
            <div class="wine-card__meta-item">
              <p class="wine-card__meta-label">Alcohol</p>
              <p class="wine-card__meta-value">${escapeHtml(String(wine.alcoholPercent))}%</p>
            </div>
            <div class="wine-card__meta-item">
              <p class="wine-card__meta-label">Inventory rows</p>
              <p class="wine-card__meta-value">${escapeHtml(String(Array.isArray(wine.inventory) ? wine.inventory.length : 0))}</p>
            </div>
            <div class="wine-card__meta-item">
              <p class="wine-card__meta-label">Square ID</p>
              <p class="wine-card__meta-value">${escapeHtml(wine.squareItemId || "Not linked")}</p>
            </div>
          </div>
          <div class="wine-card__footer">
            <div class="wine-card__chips">
              ${grapes.map((grape) => `<span class="chip">${escapeHtml(grape)}</span>`).join("") || '<span class="chip">No grapes listed</span>'}
            </div>
          </div>
        </article>
      `
    })
    .join("")
}

function setFormMode(mode, wine) {
  if (!elements.editorTitle) {
    return
  }

  elements.editorTitle.textContent = mode === "edit" && wine
    ? `Editing ${wine.name}`
    : "Create a new wine"
}

function resetForm() {
  if (!elements.wineForm) {
    return
  }

  elements.wineForm.reset()
  if (elements.wineId) {
    elements.wineId.value = ""
  }
  state.selectedWineId = ""
  setFormMode("create")
  if (elements.deleteButton) {
    elements.deleteButton.disabled = true
  }
  renderSelectOptions(elements.wineryId, state.wineries, "Choose winery")
  renderSelectOptions(elements.regionId, state.regions, "Choose region")
  renderWineList()
}

function fillForm(wine) {
  state.selectedWineId = wine.id
  setFormMode("edit", wine)

  if (elements.wineId) {
    elements.wineId.value = wine.id
  }

  document.getElementById("name").value = wine.name || ""
  document.getElementById("vintage").value = String(wine.vintage || "")
  document.getElementById("country").value = wine.country || ""
  document.getElementById("alcoholPercent").value = String(wine.alcoholPercent || "")
  document.getElementById("grapeVarieties").value = Array.isArray(wine.grapeVarieties)
    ? wine.grapeVarieties.join(", ")
    : ""
  document.getElementById("imageUrl").value = wine.imageUrl || ""
  document.getElementById("squareItemId").value = wine.squareItemId || ""
  document.getElementById("description").value = wine.description || ""

  renderSelectOptions(elements.wineryId, state.wineries, "Choose winery")
  renderSelectOptions(elements.regionId, state.regions, "Choose region")

  if (elements.wineryId) {
    elements.wineryId.value = wine.wineryId || ""
  }

  if (elements.regionId) {
    elements.regionId.value = wine.regionId || ""
  }

  if (elements.deleteButton) {
    elements.deleteButton.disabled = false
  }

  renderWineList()
}

function readFormPayload() {
  return {
    name: document.getElementById("name").value.trim(),
    vintage: Number(document.getElementById("vintage").value),
    wineryId: document.getElementById("wineryId").value,
    regionId: document.getElementById("regionId").value,
    country: document.getElementById("country").value.trim(),
    grapeVarieties: document.getElementById("grapeVarieties").value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    alcoholPercent: Number(document.getElementById("alcoholPercent").value),
    description: document.getElementById("description").value.trim(),
    imageUrl: document.getElementById("imageUrl").value.trim(),
    squareItemId: document.getElementById("squareItemId").value.trim() || undefined
  }
}

async function handleApiError(response) {
  let payload

  try {
    payload = await response.json()
  } catch {
    payload = undefined
  }

  if (response.status === 401) {
    clearSession()
    throw new Error("You are signed out. Sign in with Google to continue.")
  }

  if (response.status === 403) {
    throw new Error("Signed in, but your account does not have admin access.")
  }

  const details = payload?.details
  if (Array.isArray(details)) {
    const message = details.map((issue) => issue.message).join("; ")
    throw new Error(message || "Validation failed.")
  }

  throw new Error(payload?.error || `Request failed with status ${response.status}`)
}

async function loadAdminBootstrap() {
  if (!state.token) {
    setStatus("Sign in with Google to continue.", "error")
    return
  }

  setLoading(true)
  setStatus("Loading catalog and admin options...")

  try {
    const [optionsResponse, winesResponse] = await Promise.all([
      fetch("/api/admin/wine-options", { headers: authHeaders() }),
      fetch("/api/admin/wines", { headers: authHeaders() })
    ])

    if (!optionsResponse.ok) {
      await handleApiError(optionsResponse)
    }

    if (!winesResponse.ok) {
      await handleApiError(winesResponse)
    }

    const optionsPayload = await optionsResponse.json()
    state.regions = Array.isArray(optionsPayload.regions) ? optionsPayload.regions : []
    state.wineries = Array.isArray(optionsPayload.wineries) ? optionsPayload.wineries : []
    state.wines = await winesResponse.json()
    state.filteredWines = [...state.wines]

    renderSelectOptions(elements.wineryId, state.wineries, "Choose winery")
    renderSelectOptions(elements.regionId, state.regions, "Choose region")
    renderWineList()
    const identity = state.userEmail ? `Signed in as ${state.userEmail}. ` : ""
    setStatus(`${identity}Loaded ${state.wines.length} wines.`, "success")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load admin data."
    setStatus(message, "error")
  } finally {
    setLoading(false)
  }
}

async function saveWine(event) {
  event.preventDefault()

  if (!state.token) {
    setStatus("Sign in with Google before saving changes.", "error")
    return
  }

  const wineId = elements.wineId?.value || ""
  const isEditing = Boolean(wineId)
  const payload = readFormPayload()

  setLoading(true)
  setStatus(isEditing ? "Saving changes..." : "Creating wine...")

  try {
    const response = await fetch(isEditing ? `/api/admin/wines/${encodeURIComponent(wineId)}` : "/api/admin/wines", {
      method: isEditing ? "PUT" : "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      await handleApiError(response)
    }

    const savedWine = await response.json()
    await loadAdminBootstrap()
    fillForm(savedWine)
    setStatus(isEditing ? "Wine updated." : "Wine created.", "success")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save wine."
    setStatus(message, "error")
  } finally {
    setLoading(false)
  }
}

async function deleteWineById(wineId) {
  if (!state.token) {
    setStatus("Sign in with Google before deleting wines.", "error")
    return
  }

  const selectedWine = state.wines.find((wine) => wine.id === wineId)
  if (!selectedWine) {
    setStatus("Select a wine first.", "error")
    return
  }

  const confirmed = window.confirm(`Delete ${selectedWine.name} (${selectedWine.vintage})?`)
  if (!confirmed) {
    return
  }

  setLoading(true)
  setStatus(`Deleting ${selectedWine.name}...`)

  try {
    const response = await fetch(`/api/admin/wines/${encodeURIComponent(wineId)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${state.token}`
      }
    })

    if (!response.ok) {
      await handleApiError(response)
    }

    resetForm()
    await loadAdminBootstrap()
    setStatus("Wine deleted.", "success")
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete wine."
    setStatus(message, "error")
  } finally {
    setLoading(false)
  }
}

function handleWineListClick(event) {
  const target = event.target instanceof HTMLElement ? event.target : null
  if (!target) {
    return
  }

  const actionButton = target.closest("[data-action]")
  const wineCard = target.closest("[data-wine-id]")

  if (actionButton) {
    const wineId = actionButton.getAttribute("data-wine-id")
    const action = actionButton.getAttribute("data-action")
    const wine = state.wines.find((item) => item.id === wineId)

    if (!wine) {
      return
    }

    if (action === "edit") {
      fillForm(wine)
      return
    }

    if (action === "delete") {
      void deleteWineById(wine.id)
      return
    }
  }

  if (wineCard) {
    const wineId = wineCard.getAttribute("data-wine-id")
    const wine = state.wines.find((item) => item.id === wineId)
    if (wine) {
      fillForm(wine)
    }
  }
}

function restoreToken() {
  const savedToken = window.localStorage.getItem(STORAGE_KEY)
  if (!savedToken) {
    return
  }

  persistSession(savedToken)
}

function bindEvents() {
  elements.signInButton?.addEventListener("click", () => {
    const returnTo = sanitizePath(window.location.pathname || "/admin/wines")
    const targetUrl = `/api/auth/google/start?returnTo=${encodeURIComponent(returnTo)}`
    window.location.assign(targetUrl)
  })

  elements.signOutButton?.addEventListener("click", () => {
    clearSession()
    resetForm()
    state.wines = []
    state.filteredWines = []
    renderWineList()
    setStatus("You have been signed out.", "success")
  })

  elements.wineForm?.addEventListener("submit", saveWine)
  elements.resetEditor?.addEventListener("click", () => {
    resetForm()
    setStatus("Editor reset for a new wine.")
  })
  elements.refreshWines?.addEventListener("click", () => {
    void loadAdminBootstrap()
  })
  elements.deleteButton?.addEventListener("click", () => {
    if (state.selectedWineId) {
      void deleteWineById(state.selectedWineId)
    }
  })
  elements.wineSearch?.addEventListener("input", applySearchFilter)
  elements.wineList?.addEventListener("click", handleWineListClick)
}

setAuthUiState()
const { hadTokenInHash } = initializeAuthFromUrl()
restoreToken()
bindEvents()
resetForm()

if (state.token) {
  void loadAdminBootstrap()
} else if (!hadTokenInHash) {
  setStatus("Sign in with Google to continue.")
}
