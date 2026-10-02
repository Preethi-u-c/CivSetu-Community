const BASE_URL = "http://localhost:3000";

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function run() {
  console.log("==================================================================");
  console.log(" Local News Module: Public API, Web Pages & Admin CRUD Test Suite");
  console.log("==================================================================\n");

  // 1. Check Public News API
  console.log("--- Section 1: Public News API & Filtering ---");
  const pubRes = await fetch(`${BASE_URL}/api/news`);
  assert(pubRes.status === 200, "GET /api/news returns HTTP 200");
  const pubJson = await pubRes.json();
  assert(pubJson.success === true, "Response has success: true");
  assert(Array.isArray(pubJson.data), "Response contains data array of news articles");
  assert(pubJson.count >= 6, "At least 6 initial seed news articles returned");

  // Check required fields
  const firstArticle = pubJson.data?.[0];
  assert(Boolean(firstArticle?.id), "Article has valid id");
  assert(Boolean(firstArticle?.headline), "Article has headline");
  assert(Boolean(firstArticle?.imageUrl), "Article has imageUrl");
  assert(Boolean(firstArticle?.summary), "Article has summary");
  assert(Boolean(firstArticle?.article), "Article has full article content");
  assert(Boolean(firstArticle?.category), "Article has category");
  assert(Boolean(firstArticle?.wardRelevance), "Article has wardRelevance");
  assert(firstArticle?.isPublished === true, "Article isPublished is true");
  assert(Boolean(firstArticle?.publishedAt), "Article has publish date");
  assert(Boolean(firstArticle?.authorName), "Article has authorName");

  // Check categories
  const categories = pubJson.data?.map((n) => n.category) || [];
  assert(categories.includes("Civic Development"), "Includes 'Civic Development' category");
  assert(categories.includes("Community & Culture"), "Includes 'Community & Culture' category");
  assert(categories.includes("Environment"), "Includes 'Environment' category");
  assert(categories.includes("Infrastructure"), "Includes 'Infrastructure' category");
  assert(categories.includes("Public Health"), "Includes 'Public Health' category");
  assert(categories.includes("Education & Youth"), "Includes 'Education & Youth' category");

  // Category filter
  const catRes = await fetch(`${BASE_URL}/api/news?category=Civic%20Development`);
  assert(catRes.status === 200, "GET /api/news?category=Civic Development returns HTTP 200");
  const catJson = await catRes.json();
  assert(catJson.data?.every((a) => a.category === "Civic Development"), "All filtered articles match category");

  // Ward filter
  const wardRes = await fetch(`${BASE_URL}/api/news?ward=Ward%2003`);
  assert(wardRes.status === 200, "GET /api/news?ward=Ward 03 returns HTTP 200");
  const wardJson = await wardRes.json();
  assert(
    wardJson.data?.every(
      (a) =>
        a.wardRelevance.includes("All Wards") ||
        a.wardRelevance.includes("Entire Municipality") ||
        a.wardRelevance.includes("Ward 03")
    ),
    "Ward filter returns All Wards or articles matching Ward 03"
  );

  // Keyword search filter
  const searchRes = await fetch(`${BASE_URL}/api/news?search=Temple`);
  assert(searchRes.status === 200, "GET /api/news?search=Temple returns HTTP 200");
  const searchJson = await searchRes.json();
  assert(searchJson.data?.length >= 1, "Search returns relevant articles containing query");

  // 2. Check Single Article Endpoint
  console.log("\n--- Section 2: Public Single Article API & Views Increment ---");
  const sampleArticleId = firstArticle?.id;
  const singleRes = await fetch(`${BASE_URL}/api/news/${sampleArticleId}`);
  assert(singleRes.status === 200, `GET /api/news/${sampleArticleId} returns HTTP 200`);
  const singleJson = await singleRes.json();
  assert(singleJson.success === true, "Single article fetch response success: true");
  assert(singleJson.data?.id === sampleArticleId, "Single article matches requested ID");
  assert(singleJson.data?.viewsCount >= firstArticle.viewsCount, "View count incremented");

  // Non-existent article ID
  const notFoundRes = await fetch(`${BASE_URL}/api/news/NON-EXISTENT-ID-12345`);
  assert(notFoundRes.status === 404, "Non-existent article returns HTTP 404");

  // 3. Check Public Web Pages
  console.log("\n--- Section 3: Public Web Display Pages ---");
  const newsPageRes = await fetch(`${BASE_URL}/news`);
  assert(newsPageRes.status === 200, "/news main page returns HTTP 200");

  const newsWardPageRes = await fetch(`${BASE_URL}/news?ward=Ward%2003`);
  assert(newsWardPageRes.status === 200, "/news?ward=Ward 03 returns HTTP 200");

  const detailPageRes = await fetch(`${BASE_URL}/news/${sampleArticleId}`);
  assert(detailPageRes.status === 200, `/news/${sampleArticleId} detail reader returns HTTP 200`);

  // 4. Admin Authentication & Management
  console.log("\n--- Section 4: Admin Management & Article Lifecycle ---");

  // Unauthenticated rejection
  const unauthRes = await fetch(`${BASE_URL}/api/admin/news`);
  assert(unauthRes.status === 401, "Unauthenticated GET /api/admin/news returns HTTP 401");

  // Admin login
  const loginRes = await fetch(`${BASE_URL}/api/admin/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernameOrEmail: "admin", password: "Admin@Pass2026" }),
  });
  assert(loginRes.status === 200, "Admin login returns HTTP 200");
  const cookie = loginRes.headers.get("set-cookie") || "";
  const adminCookieHeader = cookie.split(";")[0];

  // Admin List & Stats
  const adminListRes = await fetch(`${BASE_URL}/api/admin/news`, {
    headers: { Cookie: adminCookieHeader },
  });
  assert(adminListRes.status === 200, "Authenticated GET /api/admin/news returns HTTP 200");
  const adminListJson = await adminListRes.json();
  assert(adminListJson.stats?.total >= 6, "Admin response includes total count stat");
  assert(adminListJson.stats?.published >= 6, "Admin response includes published count stat");
  assert(adminListJson.stats?.totalViews > 0, "Admin response includes total views stat");

  // Admin Create Article
  const testHeadline = `Automated Community Milestone ${Date.now()}`;
  const createRes = await fetch(`${BASE_URL}/api/admin/news`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookieHeader,
    },
    body: JSON.stringify({
      headline: testHeadline,
      imageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
      category: "Civic Development",
      wardRelevance: "Ward 14, Ward 15",
      summary: "Lakshmeshwar TMC opens newly upgraded ward office in Ward 14 with integrated citizen service kiosks.",
      article: `The Lakshmeshwar Town Municipal Council has completed the modernization of the Ward 14 civic service sub-centre. Residents of Wards 14 and 15 will no longer need to travel to the central municipal office for birth/death certificates, property tax endorsements, or grievance follow-ups.

Chief Officer Basavaraj Patil inspected the digitized facility and commended the engineering wing for completing the renovation ahead of schedule. "Decentralized civic administration brings governance right to the citizen's doorstep," he remarked.`,
      authorName: "Sri. Basavaraj Patil",
      isPublished: true,
    }),
  });

  const createJson = await createRes.json();
  assert(createRes.status === 201, `POST /api/admin/news creates article with HTTP 201 (got ${createRes.status})`);
  const createdId = createJson?.data?.id;
  assert(Boolean(createdId), `Created article returned ID: #${createdId}`);
  assert(createJson?.data?.headline === testHeadline, "Headline correctly persisted");
  assert(createJson?.data?.wardRelevance === "Ward 14, Ward 15", "Ward relevance correctly persisted");
  assert(createJson?.data?.isPublished === true, "Article isPublished initially true");

  // Publish / Unpublish Toggle (Publish -> Draft)
  const toggleToDraftRes = await fetch(`${BASE_URL}/api/admin/news/${createdId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookieHeader,
    },
    body: JSON.stringify({ togglePublish: true }),
  });
  const toggleToDraftJson = await toggleToDraftRes.json();
  assert(toggleToDraftRes.status === 200, "PATCH with togglePublish: true returns HTTP 200");
  assert(toggleToDraftJson?.data?.isPublished === false, "Article toggled to isPublished: false (Draft)");

  // Verify unpublished article does NOT show in public list
  const verifyPubListRes = await fetch(`${BASE_URL}/api/news`);
  const verifyPubListJson = await verifyPubListRes.json();
  const pubIds = verifyPubListJson.data?.map((a) => a.id) || [];
  assert(!pubIds.includes(createdId), "Unpublished/draft article is hidden from public /api/news");

  // Toggle back to Published (Draft -> Published)
  const toggleToPubRes = await fetch(`${BASE_URL}/api/admin/news/${createdId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookieHeader,
    },
    body: JSON.stringify({ togglePublish: true }),
  });
  const toggleToPubJson = await toggleToPubRes.json();
  assert(toggleToPubJson?.data?.isPublished === true, "Article toggled back to isPublished: true (Published)");

  // Verify published article appears again in public list
  const verifyPubListRes2 = await fetch(`${BASE_URL}/api/news`);
  const verifyPubListJson2 = await verifyPubListRes2.json();
  const pubIds2 = verifyPubListJson2.data?.map((a) => a.id) || [];
  assert(pubIds2.includes(createdId), "Published article appears again in public /api/news");

  // Admin Update Fields
  const updateRes = await fetch(`${BASE_URL}/api/admin/news/${createdId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: adminCookieHeader,
    },
    body: JSON.stringify({
      headline: `${testHeadline} [UPDATED]`,
      category: "Municipal Governance",
    }),
  });
  const updateJson = await updateRes.json();
  assert(updateRes.status === 200, `PATCH /api/admin/news/${createdId} returns HTTP 200`);
  assert(updateJson?.data?.headline.includes("[UPDATED]"), "Headline updated successfully");
  assert(updateJson?.data?.category === "Municipal Governance", "Category updated to 'Municipal Governance'");

  // Admin Delete Article
  const deleteRes = await fetch(`${BASE_URL}/api/admin/news/${createdId}`, {
    method: "DELETE",
    headers: { Cookie: adminCookieHeader },
  });
  assert(deleteRes.status === 200, `DELETE /api/admin/news/${createdId} returns HTTP 200`);

  // Verify Deletion (404)
  const verifyDeleteRes = await fetch(`${BASE_URL}/api/admin/news/${createdId}`, {
    headers: { Cookie: adminCookieHeader },
  });
  assert(verifyDeleteRes.status === 404, "Deleted article returns HTTP 404");

  // 5. Admin News Web Page
  console.log("\n--- Section 5: Admin Web Pages ---");
  const adminPageRes = await fetch(`${BASE_URL}/admin/news`, {
    headers: { Cookie: adminCookieHeader },
  });
  assert(adminPageRes.status === 200, "/admin/news returns HTTP 200");

  console.log("\n==================================================================");
  console.log(` Local News Test Results:`);
  console.log(`   Passed: ${passed}`);
  console.log(`   Failed: ${failed}`);
  console.log("==================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
