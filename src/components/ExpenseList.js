import React from 'react'
import { ExpenseItem } from './ExpenseItem'
import { MdDelete } from 'react-icons/md'

export const ExpenseList = ({expenses, handleEdit, handleDelete, clearItems}) => {
    return (
        <>
        <ul className="list">
            {expenses.map((expense, i) => <ExpenseItem key={i} expense={expense} handleEdit={handleEdit} handleDelete={handleDelete}/>)}
            {/* {expenses.map((expense, i) => <ExpenseItem key={expense.id} id={expense.id} charge={expense.charge} amount={expense.amount} />)} */}
            {/* {expenses.map((expense, i) => <li> key={expenses[i].id} id={expenses[i].id} charge={expenses[i].charge} amount={expenses[i].amount} </li>)} */}
            {/* {expenses.map((expense, i) => <li> key={expense.id} id={expense.id} charge={expense.charge} amount={expense.amount} </li>)} */}
        </ul>
        {/* onClick() can't call directly the clearItems since it will execute the functions directly without waiting for click, use arrow function to wait for click as callback function */}
        {expenses.length >0 && <button className="btn" onClick={() => {clearItems()}}>Clear Expenses<MdDelete className="btn-icon" /></button>}
        </>
    )
}
