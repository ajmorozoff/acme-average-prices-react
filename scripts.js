/* eslint-disable react/no-multi-comp */
/* eslint-disable react/react-in-jsx-scope */
const { Component } = React;
const { render } = ReactDOM;
const { HashRouter, Route, Link, Switch, Redirect } = ReactRouterDOM;

const root = document.getElementById('root');

const companiesURL = 'https://acme-users-api-rev.herokuapp.com/api/companies';
const productsURL = 'https://acme-users-api-rev.herokuapp.com/api/products';
const offeringsURL = 'https://acme-users-api-rev.herokuapp.com/api/offerings';

class App extends Component {
    constructor() {
        super();
        this.state = {
            companies: [],
            products: [],
            offerings: [],
        }
    }

    async componentDidMount() {
        await this.fetchData();
    }

    async fetchData() {
        const companies = (await axios.get(companiesURL)).data;
        const products = (await axios.get(productsURL)).data;
        const offerings = (await axios.get(offeringsURL)).data;
        console.log('companies', companies);
        console.log('products', products);
        console.log('offerings', offerings);
        this.setState({ companies, products, offerings});
    }

    averagePrice(arr) {
        //TODO: Ask diego if it's better practice to calculate data here or in child components?
        return (arr.reduce((sum, offer) => {return sum + offer.price}, 0) / arr.length).toFixed(2);
    }

    mapOfferingCompanies(offerArr, companyArr) {
        return offerArr.map(offer => {
            offer.company = companyArr.find(company => company.id === offer.companyId);
            return offer;
        })
    }

    mapProductOfferings(prodArr, offerArr) {
        return prodArr.map(prod => {
            let offers = [];
            let prodOffers = offerArr.filter(offer => offer.productId === prod.id).sort((a, b) => a.price - b.price);
            prod.offers = prodOffers;
            prod.lowestPrice = prodOffers[0];
            prod.avgPrice = this.averagePrice(prodOffers);
            return prod;
        })
    }

    render() {
        const { companies, products, offerings} = this.state;
        const processedOffers = this.mapOfferingCompanies(offerings, companies);
        const processedProds = this.mapProductOfferings(products, processedOffers);
        console.log(processedOffers);
        console.log(processedProds);
        if (!companies.length) {
            return (
                <div id="container">
                    Loading ...
                </div>
            )
        }
        return (
            <div id="app-container">
                <h1>Acme Product Averages React</h1>
                <HashRouter>
                    <NavBar />
                    <Switch>
                        <Route path="/products/:id" render={(props) => <ProductPage id={props.match.params.id} products={processedProds} />} />
                        <Route path="/products" render={() => <ListingsPage products={processedProds} />} />
                        <Route path="/" exact render={() => <HomePage prodCount={products.length} avgPrice={this.averagePrice(offerings)} />} />
                    </Switch>
                </HashRouter>
            </div>
        )
    }
}

class ListingsPage extends Component {
    constructor(props) {
        super();
        this.state = {
            products: props.products,
        }
    }
    render() {
        const { products } = this.state;
        return (
            <div id="listings-page">
                <h2>Our Products</h2>
                {products.map(product => {
                    return <ProductCard key={product.id} product={product} />
                })}
            </div>
        )
    }
}

const ProductCard = (props) => {
    const { product } = props;
    return (
        <div className="product-card">
            <h5><Link to={`/products/${product.id}`}>{`${product.name}`}</Link></h5>
            <p><span className="emph">Suggested Price: </span>{`$${product.suggestedPrice}`}</p>
            <p><span className="emph">Average Offered Price: </span>{`$${product.avgPrice}`}</p>
            <p><span className="emph">Lowest Offered Price: </span>{`$${product.lowestPrice.price} offered by ${product.lowestPrice.company.name}`}</p>
        </div>
    )
}

const ProductPage = (props) => {
    const { products, id } = props;
    const product = products.find(prod => prod.id === id);
    return (
        <div id="product-page-container">
            <h2>{product.name}</h2>
            <p className="secondary">{product.description}</p>
            <p><span className="emph">Suggested Price: </span>{`$${product.suggestedPrice}`}</p>
            <h4>All Offerings: </h4>
            {
                product.offers.map(_offer => {
                    return (
                        <div key={_offer.id} className="offer-listing">
                            <h5>{_offer.company.name}</h5>
                            <p>{`Offered at $${_offer.price}`}</p>
                        </div>
                    )
                })
            }
        </div>
    )
}

const HomePage = (props) => {
    const { prodCount, avgPrice } = props;
    return (
        <div id="home-page">
            <h2>Home</h2>
            <p className="body-primary">
                {`We have ${prodCount} products, with an average price of $${avgPrice}`}
            </p>
        </div>
    )
}

const NavBar = () => {
    return (
        <div id="nav-bar" className="nav-container">
            <div className="nav-tab"><Link to="/">Home</Link></div>
            <div className="nav-tab"><Link to="/products">Our Products</Link></div>
        </div>
    )
}

render(<App />, root);
