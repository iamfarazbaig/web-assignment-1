import React, {Component, Fragment} from 'react'
import Food from '../../components/Food/Food'
import BuildControls from '../../components/Food/BuildControls/BuildControls'
import OPage from '../../components/UI/OPage/OPage'
import OrderSummary from '../../components/Food/OrderSummary/OrderSummary'
import axios from '../../axios-orders'
import Spinner from '../../components/UI/Spinner/Spinner'
import withErrorHandling from '../../hoc/withErrorHandling/withErrorhandling'
const INGREDIENT_PRICES = { //Global const for prices
        lettuce: 1,
        cheese:  2,
        chilli:  0.5,
        Patty:3
}

class FoodBuilder extends Component {
    state= {
        ingredients: null, //key value pairs key:ingredients, value:amount,
        totalPrice: 0,//base price is 0
        canPurchase : false,
        purchaseMode : false,
        loading: false,
        error: false
    }

    componentDidMount () {
        axios.get('https://assignment1-fb.firebaseio.com/ingredients.json')
        .then(response => {
            this.setState({ingredients: response.data})
        })
        .catch(error => {
            this.setState({error: true});
        });
    }

    purchaseState (ingredients) {
         const sum = Object.keys(ingredients) //creating an array of string entities 
                .map(iKey => { return ingredients[iKey]}) //using map to replace old value of ingredient with new ones by iKey. we are getting the numbers for ingredients
                .reduce((sum, el) => {
                    return sum + el;
                }, 0)// to return sum of all ingredients, keeping initialValue = 0 and el is the value accessed from ingredients[iKey]
        this.setState({canPurchase : sum > 0})
            }

    addIngredients = (type) => {
        const prevCount = this.state.ingredients[type]//to add ingredient we need to know previous ingredient count
        const updatedCount = prevCount + 1
        const updatedIngredient = {...this.state.ingredients}//to update state in immutable way spread operator is used 
        updatedIngredient[type] = updatedCount

        const sumOfPrice = INGREDIENT_PRICES[type]
        const prevPrice = this.state.totalPrice
        const updatedPrice = prevPrice + sumOfPrice
        this.setState({totalPrice: updatedPrice, ingredients: updatedIngredient})
        this.purchaseState(updatedIngredient); //pass updatedIngredient to purchaseState for updated values
    }

    removeIngredients = (type) => {
        const prevCount = this.state.ingredients[type]
        if(prevCount <= 0) { //to avoid error if count goes less than 0 as array cant return negative value
            return 
        }
        const updatedCount = prevCount - 1
        const updatedIngredient = {...this.state.ingredients}
        updatedIngredient[type] = updatedCount

        const DeductionOfPrice = INGREDIENT_PRICES[type]
        const prevPrice = this.state.totalPrice
        const updatedPrice = prevPrice - DeductionOfPrice
        this.setState({totalPrice: updatedPrice, ingredients: updatedIngredient})
        this.purchaseState(updatedIngredient);
        }

    purchaseHandler = () => {
        this.setState({purchaseMode : true})
    } 

    cancelPurchaseHandler= () => { //to remove order summary box
        this.setState({purchaseMode : false})
    } 

    continuePurchaseHandler = () => {
        // alert('Continue please')
       
        const queryParameters = []
        for(let i in this.state.ingredients) {
            queryParameters.push(encodeURIComponent(i) + '=' + encodeURIComponent(this.state.ingredients[i]))//encodes elements such that it can be used in url. i is the key/property name in the ingredients.here, we set the property name '=' value for that property name
        }
        queryParameters.push('price= ' + this.state.totalPrice)//to pass this to the query parameter for the totalprice in the contact details orderHandler

        const queryString = queryParameters.join('&')

        this.props.history.push({
            pathname: '/checkout',
            search: '?' + queryString //we need to encode the ingredients into this search query
        })
    }

    render () {
        let orderSummary = null;
        let food = this.state.error ? <p>Something went wrong!</p> : <Spinner />
        if(this.state.ingredients) { //we do this to avoid failing of build controls
            food = (
                <Fragment>
                    <Food ingredients={this.state.ingredients}/> {/*Passing key value pairs of ingredients given. graphical rep of food with ingredients */}
                    <BuildControls
                        newIngredientAdded = {this.addIngredients}  //Add or remove ingredients 
                        ingredientRemoved = {this.removeIngredients}
                        canPurchase = {this.state.canPurchase}
                        myOrder = {this.purchaseHandler}
                        price = {this.state.totalPrice} />
                </Fragment>) 
                orderSummary = <OrderSummary //we are overriding order summary in the same if statement
                    ingredients = {this.state.ingredients}
                    purchaseCancelEvent = {this.cancelPurchaseHandler} 
                    purchaseContinueEvent = {this.continuePurchaseHandler}
                    cost ={this.state.totalPrice}/>
        }
        if(this.state.loading) { //overriding if loading was set(to overrride summary if needed)
            orderSummary = <Spinner />
        }
       
        return (
            <Fragment>
                <OPage show ={this.state.purchaseMode} closeOPage={this.cancelPurchaseHandler}>
                   {orderSummary}
                </OPage>
                {food}
            </Fragment>
        )
    }
}

export default withErrorHandling(FoodBuilder, axios)