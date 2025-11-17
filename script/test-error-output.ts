import Axon, { AxonError } from "../Axon";

async function testErrorOutput() {
  const client = Axon.new().baseUrl("https://jsonplaceholder.typicode.com");

  console.log("=== Test 1: 404 Error ===");
  try {
    await client.get("/posts/99999").data();
  } catch (error) {
    console.log("Error caught:");
    console.log(error);
    console.log("\n--- Error.toString() ---");
    console.log(error.toString());
    console.log("\n--- Error properties ---");
    if (error instanceof AxonError) {
      console.log("status:", error.status);
      console.log("statusText:", error.statusText);
      console.log("url:", error.url);
      console.log("method:", error.method);
      console.log("responseData:", error.responseData);
      console.log("message:", error.message);
    }
  }

  console.log("\n\n=== Test 2: Network Error (Invalid Domain) ===");
  const client2 = Axon.new().baseUrl(
    "https://this-domain-definitely-does-not-exist-12345.com"
  );
  try {
    await client2.get("/api/test").data();
  } catch (error) {
    console.log("Error caught:");
    console.log(error);
    console.log("\n--- Error.toString() ---");
    console.log(error.toString());
  }

  console.log("\n\n=== Test 3: 400 Bad Request ===");
  try {
    // This should trigger a validation error
    await client
      .post("/posts", {
        invalid: "data with way too much content ".repeat(1000),
      })
      .data();
  } catch (error) {
    console.log("Error caught:");
    console.log(error);
    console.log("\n--- Error.toString() ---");
    console.log(error.toString());
  }
}

testErrorOutput().catch(console.error);
