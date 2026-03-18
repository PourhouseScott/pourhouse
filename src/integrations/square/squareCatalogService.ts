import type { CatalogClient } from "square/api/resources/catalog/client/Client";

export class SquareCatalogService {
  public constructor(private readonly catalogClient: CatalogClient) { }

  public async fetchCatalogItems() {
    const items: unknown[] = [];

    const page = await this.catalogClient.list({
      types: "ITEM,ITEM_VARIATION"
    });

    for await (const item of page) {
      items.push(item);
    }

    return items;
  }
}
