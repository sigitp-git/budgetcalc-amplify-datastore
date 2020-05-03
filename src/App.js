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

const initialExpenses = []

function App() {

  const [expenses, setExpenses] = useState(initialExpenses)

  const [charge, setCharge] = useState('')

  const [amount, setAmount] = useState('')

  const [alert, setAlert] = useState({show:false})

  const [edit, setEdit] = useState(false)

  const [id, setId] = useState(0)

  const handleCharge = (e) => {
    setCharge(e.target.value)
  }

  const handleAmount = (e) => {
    setAmount(e.target.value)
  }

  const handleAlert = ({type, text}) => {
    setAlert({show:true, type, text})
    setTimeout(() => {setAlert({show:false})}, 1000)
  }

  const handleEdit = (id) => {
    let editExpense = expenses.find((item) => item.id === id)
    let {charge, amount} = editExpense;
    setCharge(charge)
    setAmount(amount)
    setEdit(true)
    setId(id)
  }

  const handleDelete = (id) => {
    let tempExpenses = expenses.filter( (item) => item.id !== id)
    setExpenses(tempExpenses)
    removeExpense(id)
    handleAlert({type: "danger", text: "item deleted"})
  }

  const clearItems = () => {
    setExpenses([])
    DataStore.delete(Expense, Predicates.ALL)
    handleAlert({type: "danger", text: "items cleared"})
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if( charge !== '' && amount > 0) {
      if(edit) {
        let editExpenses = expenses.map((item) => {return item.id === id? {...item, charge: charge, amount: amount}:item})
        setExpenses(editExpenses)
        updateExpense(id)
        handleAlert({type:'success', text: 'Item Edited'})
      }
      else {
        const singleExpense = {id:uuidv4(), charge:charge, amount:amount}
        setExpenses([...expenses, singleExpense])
        addExpense(id)
        handleAlert({type:'success', text: 'Item Added'})
      }
      setEdit(false)
      setCharge("")
      setAmount("")
    }
    else {
      handleAlert({type:'danger', text: `Charge can't be empty and amount can't be zero`})
    }
  }

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
  
  return <>
      {alert.show && <Alert type={alert.type} text={alert.text}/>}
      <a href="./"><h1>BUDGET CALCULATOR</h1></a>
      <main className="App">
      <ExpenseForm charge={charge} handleCharge={handleCharge} amount={amount} handleAmount={handleAmount} handleSubmit={handleSubmit} edit={edit}/>
      <ExpenseList expenses={expenses} handleEdit={handleEdit} handleDelete={handleDelete} clearItems={clearItems}/>
      </main>
      <h1>
        Total Spend: $<span className="Total">
        {expenses.reduce((acc, cur) => {
          return acc +=parseInt(cur.amount)
        },0)}
        </span>
      </h1>
    </>
}

export default App;