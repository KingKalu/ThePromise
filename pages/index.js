import Head from "next/head";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <Head>
        <title>The Promise • Order Your Favorites in Minutes</title>
        <meta
          name="description"
          content="Order your favorite burgers, fries, and drinks in minutes with The Promise smart dining platform."
        />
        <meta
          name="keywords"
          content="burger delivery, fast food, online ordering, The Promise, restaurant"
        />
        <meta
          property="og:title"
          content="The Promise • Order Your Favorites in Minutes"
        />
        <meta
          property="og:description"
          content="Crisp red and yellow experience for ordering burgers, fries, and drinks across branches."
        />
      </Head>

      <header className="header">
        <div className="container topbar">
          <div className="brand">
            <img
              className="logo"
              src="/assets/logos/The-Promise-Logo-Small-Icon.png"
              alt="The Promise Logo"
            />
          </div>

          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/order">Order</Link>
            <Link href="/kitchen">Kitchen</Link>
            <Link href="/admin">Head Office</Link>
          </nav>

          <div className="cta">
            <Link className="btn primary" href="/order">
              Start Ordering
            </Link>
            <Link className="btn outline" href="/admin">
              View Analytics
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero section */}
        <section className="hero hero-burger">
          <div className="container hero-burger-grid">
            <div className="hero-burger-left">
              <p className="hero-kicker">Fast • Fresh • Multi-Branch</p>
              <h1 className="hero-burger-headline">
                Order Your
                <br />
                Favorites in Minutes.
              </h1>
              <p className="hero-burger-subhead">
                Burgers, fries, and drinks from The Promise, routed
                automatically to your nearest branch. Dine-in, takeaway, or
                delivery in a few taps.
              </p>
              <div className="hero-burger-ctas">
                <Link className="btn primary hero-primary" href="/order">
                  Order Now
                </Link>
                {/* <Link className="btn outline hero-outline" href="/qr">
                  View Menu
                </Link> */}
              </div>
            </div>

            <div className="hero-burger-right">
              <img
                className="hero-burger-image"
                src="/assets/images/hero-burger.png"
                alt="Hero Burger"
              />
            </div>
          </div>
        </section>

        {/* Product cards */}
        <section className="section products-section">
          <div className="container products-grid">
            {[
              {
                name: "Raitter Berineads",
                price: "£150.00 / item",
                badge: "Best",
                image: "/assets/images/menu-plantain.jpg",
              },
              {
                name: "Pest Kinger",
                price: "£114.00 / item",
                badge: "Hot",
                image: "/assets/images/menu-chicken.jpg",
              },
              {
                name: "Fast Bedivery",
                price: "£152.00 / item",
                badge: "New",
                image: "/assets/images/riceAndChicken.jpg",
              },
              {
                name: "Crispy Deluxe",
                price: "£132.00 / item",
                badge: "Chef",
                image: "/assets/images/menu-pizza.jpg",
              },
            ].map((product) => (
              <article key={product.name} className="product-card">
                <div className="product-image-box">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="product-image"
                  />
                </div>

                <div className="product-card-body">
                  <div className="product-card-header">
                    <span className="product-badge">{product.badge}</span>
                  </div>

                  <h3 className="product-name">{product.name}</h3>

                  <p className="product-description">
                    The Promise burger experience with crisp lettuce, melted
                    cheese, and a soft sesame bun.
                  </p>

                  <div className="product-footer">
                    <span className="product-price">{product.price}</span>
                    <button className="btn primary product-cta">Order</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Bottom split section */}
        <section className="section bottom-split">
          <div className="container bottom-split-grid">
            <div className="bottom-left-card">
              <div className="bottom-left-media">
                <img
                  className="bottom-left-image"
                  src="/assets/images/dispatch-rider.png"
                  alt="Dispatch Rider"
                />
              </div>

              <div className="bottom-left-body">
                <h2 className="bottom-left-title">Orde Fod The Burgers.</h2>
                <ul className="bottom-left-list">
                  <li>
                    <strong>Keys</strong> – Manage orders from any branch in one
                    view.
                  </li>
                  <li>
                    <strong>Fries</strong> – Add sides, combos, and extras
                    without slowing the line.
                  </li>
                </ul>
                <button className="btn primary bottom-left-cta">
                  Order Delivery
                </button>
              </div>
            </div>

            <div className="bottom-right-card">
              <div className="bottom-right-image-box">
                <img
                  src="/assets/images/chicken-curry.png"
                  alt="Refreshing drink and sides"
                  className="hero-burger-image"
                />
              </div>
              <h3 className="bottom-right-title">Sarcy Blarth</h3>
              <p className="bottom-right-text">
                Bright, sparkling drink that pairs perfectly with your favorite
                Promise burger.
              </p>
              <button className="btn outline bottom-right-cta">
                Choose Tour
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container">
          © The Promise. Order Your Favorites in Minutes.
        </div>
      </footer>
    </>
  );
}
