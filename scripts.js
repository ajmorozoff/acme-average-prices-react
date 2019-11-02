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
        //TODO: round this to two decimal places;
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
            let prodOffers = offerArr.filter(offer => offer.productId === prod.id);
            prodOffers.sort((a, b) => a.price - b.price);
            console.log(prodOffers);
            prod.avgPrice = this.averagePrice(prodOffers);
            prod.lowestPrice = prodOffers[0];
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
                        <Route path="/" render={() => <HomePage prodCount={products.length} avgPrice={this.averagePrice(offerings)} />} />
                    </Switch>
                </HashRouter>
            </div>
        )
    }
}

class ListingsPage extends Component {
    constructor(props) {
        super();
    }
    render() {
        return (
            <div id="listings-page">
                Listings page
            </div>
        )
    }
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
        <div id="nav-bar">
            <Link to="/">Home</Link>
            <Link to="/products">Our Products</Link>
        </div>
    )
}

render(<App />, root);
