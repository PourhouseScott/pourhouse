function createPourhouseWineListEmbed(target, options) {
  if (!target) {
    return null
  }

  const settings = options || {}
  const baseUrl = (settings.baseUrl || window.location.origin || "").replace(/\/$/, "")
  const compact = settings.compact === true
  const apiBase = typeof settings.apiBase === "string" ? settings.apiBase : ""

  const src = new URL(`${baseUrl}/embed/wine-list`)

  if (compact) {
    src.searchParams.set("compact", "true")
  }

  if (apiBase) {
    src.searchParams.set("apiBase", apiBase)
  }

  const iframe = document.createElement("iframe")
  iframe.src = src.toString()
  iframe.loading = "lazy"
  iframe.referrerPolicy = "strict-origin-when-cross-origin"
  iframe.style.width = settings.width || "100%"
  iframe.style.height = settings.height || "780px"
  iframe.style.border = "0"
  iframe.style.display = "block"

  target.innerHTML = ""
  target.appendChild(iframe)

  return iframe
}

window.createPourhouseWineListEmbed = createPourhouseWineListEmbed
