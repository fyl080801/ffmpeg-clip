import "./style.css"
import { createApp } from "vue"
import App from "./App.vue"
import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      name: "movie",
      path: "/movie",
      component: () => import("./views/MovieView.vue")
    },
    {
      name: "clip",
      path: "/clip",
      component: () => import("./views/ClipView.vue")
    },
    {
      path: "/",
      redirect: "/clip"
    }
  ]
})

createApp(App).use(router).mount("#app")
