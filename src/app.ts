import initBlogApiApp from "./server";

const port = process.env.PORT;

initBlogApiApp().then((blogApiApp) => {
  blogApiApp.listen(port, () => {
    console.log(`app listening at http://localhost:${port}`);
  });
});
