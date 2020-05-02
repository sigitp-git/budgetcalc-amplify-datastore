import React, { useState, useEffect }from 'react';
import './App.css';
import { v4 as uuidv4 } from 'uuid'

import { ExpenseList } from './components/ExpenseList'
import { ExpenseForm } from './components/ExpenseForm'
import { Alert } from './components/Alert'

import Amplify from "@aws-amplify/core";
import { DataStore, Predicates } from "@aws-amplify/datastore";
import {Expense} from "./models";
import awsConfig from "./aws-exports";
Amplify.configure(awsConfig);

// from Udemy class by John Hilga
// const initialExpenses = [
//   { id: uuidv4(), charge: "rent", amount: 1600 }, 
//   { id: uuidv4(), charge: "car", amount: 400 }, 
//   { id: uuidv4(), charge: "credit", amount: 1200 }
// ]

// const initialExpenses = []

// local storage initialExpenses, localStorage provided by the browser
// ternary operator check if expenses exist on local storage, if yes return it as object{}, if not pass empty array object
// local storage stores strings, JSON.parse() return strings into JSON based object{}
// later the localsotrage must be set to save/store the expenses so everytime browser refresh, it stores expenses on localStorage
// useEffect() hook is useful to do this
// useEffect() is function that runs after each DOM render, with 2 params: 1. callback function, 2. array whether to use or not to use the useEffect()
// callback function is the function to invoke on each render
// name the variable to store "stored-expenses"
// useEffect() called inside the function App()
// React re-renders DOM if state changed or if props changed!!!!!

// const initialExpenses = localStorage.getItem('stored-expenses')? JSON.parse(localStorage.getItem('stored-expenses')): []

// Amplify Datastore
const initialExpenses = []

// import useState() from 'react'
// useState is a hook, a function returns [] with 2 valus
// first is the actual value of the state, for example: employee
// second is the function to update/controle the state, for example: setEmployee
// initial value could be anything: string, empty object, empty array, anything
// depends on what to render, if we going to render employeelist, then assign initial value to array of employeelist objects (id, name, email, etc), 
// initial value includes all objects (all employees) inside that array variable
// below example, since we want to render expenses list, we assign initial value const result = useState(initialExpenses) 
// which put all 3 initial value object array into the initial state value
// in RFC or RAFC, React Functional Component or React Arrow Functional Component, we call functions, not methods
// methods is for RCC, React Class Component

function App() {
  // ******************** state values ************************************************************************************************************************
  // all expenses, add expense
  const [expenses, setExpenses] = useState(initialExpenses)
  //console.log(expenses, setExpenses)

  // single expense, initial value emptry string
  const [charge, setCharge] = useState('')

  // single amount, initial value empty string
  const [amount, setAmount] = useState('')

  // alert state, initial value is key value pair object{} show:false
  const [alert, setAlert] = useState({show:false})

  // edit, initial value false
  const [edit, setEdit] = useState(false)

  // edit item, initial value 0
  const [id, setId] = useState(0)


  // ******************** functionality ************************************************************************************************************************
  // handling Charge form change, variable: e.target.value is the form value sent, change it from empty string
  const handleCharge = (e) => {
    //console.log(`charge: ${e.target.value}`);
    
    setCharge(e.target.value)
  }

  // handling Amount form change, variable: e.target.value is the form value sent, change it from empty string
  const handleAmount = (e) => {
    //console.log(`amount: ${e.target.value}`);

    setAmount(e.target.value)
  }

  // handling Alert, variable: 
  const handleAlert = ({type, text}) => {
    setAlert({show:true, type, text})
    //setTimeOut JavaScript function, 3000 ms = 3 sec, duration to call the callback function
    setTimeout(() => {setAlert({show:false})}, 1000)
  }

  // handling edit single item
  // most complex function
  const handleEdit = (id) => {
    let editExpense = expenses.find((item) => item.id === id)
    //console.log(editExpense)
    let {charge, amount} = editExpense;
    setCharge(charge)
    setAmount(amount)
    setEdit(true)
    setId(id)
  }

  // handling delete single item
  const handleDelete = (id) => {
    //console.log(`item deleted: ${id}`)
    let tempExpenses = expenses.filter( (item) => item.id !== id)
    //console.log(tempExpenses)
    setExpenses(tempExpenses)
    removeExpense(id)
    handleAlert({type: "danger", text: "item deleted"})
  }

  // handling clear all items
  const clearItems = () => {
    //console.log("cleared!")
    //setExpenses is a function(), feed empty array[]
    setExpenses([])
    DataStore.delete(Expense, Predicates.ALL)
    handleAlert({type: "danger", text: "items cleared"})
  }

  // handling Submit button change
  const handleSubmit = (e) => {
    e.preventDefault()
    //console.log(charge, amount)
    if( charge !== '' && amount > 0) {
      if(edit) {
        // editing submission
        // placing edited expense on the same id, so not creating a new expense id
        // map will inspect each expense item, return item as is if not edited by id props
        // the ternary operator statement? true:false do this
        let editExpenses = expenses.map((item) => {return item.id === id? {...item, charge: charge, amount: amount}:item})
        setExpenses(editExpenses)
        updateExpense(id)
        handleAlert({type:'success', text: 'Item Edited'})
      }
      else {
        //normal submission
        //const singleExpense = {id:uuidv4(), charge:charge, amount:amount}
        const singleExpense = {id:uuidv4(), charge:charge, amount:amount}
        // setExpenses(singleExpense) means passing object to the setExpenses function
        // the expense.map() is adding array.amount, not object amount
        // therefore add [] to make singleExpense and array
        // the ""...expenses" is spread operator to access old values, so new array object not completely overriding old values
        setExpenses([...expenses, singleExpense])
        addExpense(id)
        handleAlert({type:'success', text: 'Item Added'})
      }
      // reset charge and amount
      setEdit(false)
      setCharge("")
      setAmount("")
    }
    else {
      //handle alert, call function
      handleAlert({type:'danger', text: `Charge can't be empty and amount can't be zero`})
    }
  }

  //******************** useEffect() for localStorage ****************************************************************************************************
  // localStorage stores strings, JSON.stringify() change JSON object into strings
  // name the variable to store "stored-expenses"
  // React re-renders DOM if state changed or if props changed!!!!!
  // array [expenses] as second param to ensure only re-render DOM on expenses state change
  // because we are storing expenses as "stored-expenses" using useEffect()

  //useEffect(() => {localStorage.setItem('stored-expenses', JSON.stringify(expenses))}, [expenses])

  // Amplify Datastore Functions
  async function listExpenses() {
    const expenses = await DataStore.query(Expense, Predicates.ALL);
    setExpenses(expenses);
  }

  async function addExpense (id) {
    await DataStore.save(new Expense({id: uuidv4(), charge: charge, amount: amount}))
  }

  async function removeExpense(id) {
    const toDelete = await DataStore.query(Expense, id);
    DataStore.delete(toDelete);
  }

  async function updateExpense(id) {
    const toUpdate = await DataStore.query(Expense, id);
    await DataStore.save(Expense.copyOf(toUpdate, updated => {updated.charge = charge; updated.amount = amount}))
  }

  useEffect(() => {listExpenses()}, [expenses])

  //******************** return portion ****************************************************************************************************
  
  return <>
      {alert.show && <Alert type={alert.type} text={alert.text}/>}
      <a href="./"><h1>BUDGET CALCULATOR</h1></a>
      <main className="App">
      <ExpenseForm charge={charge} handleCharge={handleCharge} amount={amount} handleAmount={handleAmount} handleSubmit={handleSubmit} edit={edit}/>
      <ExpenseList expenses={expenses} handleEdit={handleEdit} handleDelete={handleDelete} clearItems={clearItems}/>
      </main>
      <h1>
        Total Spend: $<span className="Total">
        {/* map() takes array from array.map() then creates new array based on f operation provided on array.map(f). f receives 2 argument: accumulator, and current */}
        {/* reduce() takes array from array.reduce() then return single value based on f operation provided on array.reduce(f). f receives multiple argument: current, index, array */}
        {expenses.reduce((acc, cur) => {
          return acc +=parseInt(cur.amount)
        },0)}
        </span>
      </h1>
    </>
}

export default App;
