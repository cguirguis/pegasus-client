import React from 'react'
import axios from 'axios';
import Cookies from 'universal-cookie'
import { useLoaderData } from 'react-router-dom'
import ReactDOM from 'react-dom/client'
//import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/connectedPage.css'
import { TdaService } from '../services/tdaservice'

export async function accountLoader({ request, params }) {
  // get account details
  const tdaService = new TdaService();
  const authCode = (new URL(request.url)).searchParams.get("code")
  if (!authCode) {
    return Promise.resolve({})
  }
  return tdaService.getAccounts(authCode)
}

export default function Connected() {
  const data = useLoaderData().data;
  const isAuthenticated = data && data.length

  return (
    <div>
      {!isAuthenticated ? <div>You are not authenticated. Please connect an account!</div> : <div>
        <div className="connectedStatus">You have successfully authenticated to your TD Ameritrade account.</div>
        <br />
        <h3>Accounts</h3>
        {data && data.length && <div className="accountList"><ul>
          {data.map(account => {
            return <div className="accountSummary">
              <div>Account type: {account.securitiesAccount.type}</div>
              <div>Account ID: {account.securitiesAccount.accountId}</div>
              <div>Current balance: ${account.securitiesAccount.currentBalances.liquidationValue}</div>
            </div>
          })}
        </ul></div>}
      </div>}
    </div >
  )
}
