// @ts-check
/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */

// Lookup table for bundle discounts
const DISCOUNTS = {
  2: 5,
  3: 10,
  4: 15,
  5: 20,
};

// Function to calculate said discounts. If the discount amount is in the lookup table, use it, otherwise apply 25% discount (so, 6 items and up)
const calculateDiscount = quantity => DISCOUNTS[quantity] || 25;

// Create cart line
const createCartLine = line => ({
  cartLineId: line.id,
  quantity: line.quantity,
});

// Create merge operation
const createMergeOperation = group => ({
  merge: {
    cartLines: group.map(createCartLine),
    parentVariantId: 'gid://shopify/ProductVariant/40085867790400', // Replace this ID with the ID of the newly-created UK parent bundle product variant
    title: 'Mix and Match Bears Deal', // Check what to call the bundle
    price: {
      percentageDecrease: {
        value: calculateDiscount(group.length),
      },
    },
  },
});

// THIS is the main function which will be called by the extension, and carries out the bundling / price reduction
export function run(input) {
  /**
   * @type {Object.<string, Array<{id: string, quantity: number}>>}
   */
  const groupedItems = {};

  // Group cart lines by bundleId
  input.cart.lines.forEach(line => {
    const bundleId = line.bundleId;
    if (bundleId && bundleId.value) {
      if (!groupedItems[bundleId.value]) {
        groupedItems[bundleId.value] = [];
      }
      groupedItems[bundleId.value].push(line);
    }
  });

  return {
    operations: Object.values(groupedItems).map(createMergeOperation),
  };
}

// Default bundle parent id : 40085867790400,
// GraphQL id : "admin_graphql_api_id": "gid://shopify/ProductVariant/40085867790400"
// cartTransform object ID : "id": "gid://shopify/CartTransform/2293824"
