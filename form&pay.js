const d = document;
import STRIPE_KEYS from "./stripe-keys.js";

//FORMULARIO
d.addEventListener("submit", (e) => {
  e.preventDefault();

  const $loader = d.querySelector(".contact-form-loader");
  const $response = d.querySelector(".contact-form-response");
  const $form = d.querySelector("#form");
  $loader.classList.remove("none");

  fetch("https://formsubmit.co/ajax/tomobre@gmail.com", {
    method: "POST",
    body: new FormData(e.target),
  })
    .then((res) => (res.ok ? res.json() : Promise.reject(res)))
    .then((json) => {
      $loader.classList.add("none");
      $response.classList.remove("none");
      $response.innerHTML = `<p>Los datos han sido enviados</p>`;
      $form.reset();
    })
    .catch((err) => {
      let message = err.statusText || "ocurrio un error";
      $response.innerHTML = `<p>Error. ${err.status}: ${message}</p>`;
    })
    .finally(() => {
      setTimeout(() => {
        $response.classList.add("none");
        $response.innerHTML = "";
      }, 3000);
    });
});

//PAGO CON STRIPE

const $food = d.getElementById("food"),
  $foodTemplate = d.getElementById("food-template").content,
  $fragmentAll = d.createDocumentFragment(),
  Options = { headers: { Authorization: `Bearer ${STRIPE_KEYS.secret}` } };

let prices, products;
const moneyFormat = (num) => `$${num.slice(0, -2)}.${num.slice(-2)}`;

Promise.all([
  fetch("https://api.stripe.com/v1/products", Options),
  fetch("https://api.stripe.com/v1/prices", Options),
])
  .then((responses) => Promise.all(responses.map((res) => res.json())))
  .then((json) => {
    console.log(json);
    products = json[0].data;
    prices = json[1].data;
    //console.log(products, prices);
    prices.forEach((el) => {
      let productData = products.filter((product) => product.id === el.product);

      $foodTemplate
        .querySelector(".card-body")
        .setAttribute("data-price", el.id);
      $foodTemplate
        .querySelector(".typeOfFood")
        .setAttribute("data-type", el.nickname);

      $foodTemplate.querySelector("img").src = productData[0].images[0];
      $foodTemplate.querySelector("img").alt = productData[0].name;
      $foodTemplate.querySelector(".card-title").innerHTML = `${
        productData[0].name
      } <br>
									${moneyFormat(el.unit_amount_decimal)} ${el.currency}
									`;
      $foodTemplate.querySelector(
        ".card-text"
      ).innerHTML = `${productData[0].description}`;

      let $clone = d.importNode($foodTemplate, true);
      $fragmentAll.appendChild($clone);
    });

    $food.appendChild($fragmentAll);
  })
  .catch((err) => {
    console.log(err);
    let message =
      err.statusText || "Ocurrio un error al conectarse con el API de stripe";
    $food.innerHTML = `<p>Error ${err.status}: ${message}</p>`;
  });

d.addEventListener("click", (e) => {
  if (e.target.matches("#buy")) {
    let price = e.target.parentElement.getAttribute("data-price");

    Stripe(STRIPE_KEYS.public)
      .redirectToCheckout({
        lineItems: [{ price, quantity: 1 }],
        mode: "payment",
        successUrl: "http://tomobre.github.io/di-lorenzo/pay-success.html",
        cancelUrl: "http://tomobre.github.io/di-lorenzo/pay-cancel.html",
      })
      .then((res) => {
        if (res.error) {
          $food.insertAdjacentHTML("afterend", res.error.message);
        }
      });
  }
});

d.addEventListener("click", (e) => {
  const breakfast = d.querySelectorAll(".typeOfFood[data-type=desayuno]");
  const lunch = d.querySelectorAll(".typeOfFood[data-type=almuerzo]");
  const dinner = d.querySelectorAll(".typeOfFood[data-type=cena]");

  if (e.target.matches("#btnBreakfast")) {
    lunch.forEach((el) => {
      el.style.display = "none";
    });
    dinner.forEach((el) => {
      el.style.display = "none";
    });
    breakfast.forEach((el) => {
      el.style.display = "block";
    });
  }

  if (e.target.matches("#btnLunch")) {
    dinner.forEach((el) => {
      el.style.display = "none";
    });
    breakfast.forEach((el) => {
      el.style.display = "none";
    });
    lunch.forEach((el) => {
      el.style.display = "block";
    });
  }
  if (e.target.matches("#btnDinner")) {
    lunch.forEach((el) => {
      el.style.display = "none";
    });
    breakfast.forEach((el) => {
      el.style.display = "none";
    });
    dinner.forEach((el) => {
      el.style.display = "block";
    });
  }
  if (e.target.matches("#btnAll")) {
    lunch.forEach((el) => {
      el.style.display = "block";
    });
    breakfast.forEach((el) => {
      el.style.display = "block";
    });
    dinner.forEach((el) => {
      el.style.display = "block";
    });
  }
});
