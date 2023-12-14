import puppet from "puppeteer";
import fs from "fs";
// import { JSDOM } from "jsdom";

const getRecipes = async () => {
  const browser = await puppet.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto("https://professioneel.verstegen.be/recepten", {
    // waitUntil: "domcontentloaded",
    timeout: 0,
  });

  const recipes = await page.evaluate(() => {
    let recipeList = document.querySelectorAll(".recipe-archive-item");

    return Array.from(recipeList).map((recipe) => {
      const title = recipe.querySelector(".recipe-header h5").innerText;
      const link = recipe
        .querySelector(".recipe-archive-item-link")
        .getAttribute("href");

      return { title, link };
    });
  });

  let videos = [];

  for (let index = 0; index < recipes.length; index++) {
    const recipe = recipes[index];
    await page.goto(recipe.link, { waitUntil: "domcontentloaded", timeout: 0 });
    // await page.waitForSelector(".responsive-embed iframe");

    const recipeUrl = await page.evaluate(() => {
      const recipeShortlink = new URL(
        document.querySelector('link[rel="shortlink"]').getAttribute("href")
      );

      const recipeId = recipeShortlink.searchParams.get("p");
      // let youtubeUrl = null;
      // const youtubeIframe = document.querySelector(".responsive-embed iframe");
      // if (youtubeIframe) {
      //   youtubeUrl = youtubeIframe;
      //   // .querySelector(".ytp-title-link.yt-uix-sessionlink")
      //   // .getAttribute("href");
      // }

      return { recipeId };
    });

    const frames = page.frames();

    let youtubeUrl = [];
    for (let indexFrame = 0; indexFrame < frames.length; indexFrame++) {
      const frame = frames[indexFrame];
      const name = frame.name();
      const iframeContent = await frame.content();
      if (iframeContent.includes("watch")) {
        youtubeUrl[indexFrame] = iframeContent;
      }
      // const dom = new JSDOM(iframeContent);
    }

    recipeUrl.youtube_url = youtubeUrl;
    recipeUrl.title = recipe.title;
    recipeUrl.link = recipe.link;

    videos.push(recipeUrl);
  }

  console.log(videos);

  await page.close();

  await browser.close();

  videos = JSON.stringify(videos);

  fs.writeFile("recipes_youtube.json", videos, "utf8", function (err) {
    if (err) throw err;
    console.log("complete");
  });
};

getRecipes();
