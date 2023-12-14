import puppet from "puppeteer";

const getRecipes = async () => {
  const browser = await puppet.launch({
    headless: false,
    defaultViewport: null,
  });

  let videos = [];

  const page = await browser.newPage();

  await page.goto("https://professioneel.verstegen.be", {
    // waitUntil: "domcontentloaded",
    timeout: 0,
  });
  await page.type(".recipe.custom-slider-item", "automate beyond recorder");

  const recipeCards = await page.evaluate(() => {
    const recipeList = document.querySelectorAll(".recipe.custom-slider-item");

    const recipeData = Array.from(recipeList).map((recipeItem) => ({
      title: recipeItem.querySelector(".recipe-header").innerHTML,
      url: recipeItem.querySelector("a").getAttribute("href"),
    }));

    const filteredRecipeData = recipeData.filter(
      (filterItem) =>
        filterItem.url !== "https://professioneel.verstegen.be/recepten/"
    );

    return filteredRecipeData;
  });

  await page.goto(recipeCards?.[0].url);
  //   console.log(videos);

  await browser.close();
};

getRecipes();
