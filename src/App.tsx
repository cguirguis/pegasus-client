import { useState, useEffect, useRef } from 'react'
import { Outlet, Link, NavLink, useLoaderData, useNavigation, useSubmit, useFetcher, Form, redirect } from "react-router-dom";
import { Stack, Button, Alert, Nav, Navbar, Container, NavDropdown, Offcanvas } from "react-bootstrap"
import { getContacts, createContact } from "./contacts";
import './App.css'

export async function userLoader({ request, params }) {
  // const accountToken = params.tdAmeritradeToken
  const url = new URL(request.url)
  const q = url.searchParams.get("q")
  const contacts = await getContacts(q);
  return { contacts, q };
  // return fetch('/api/auth', { method: 'post', body: {} }))
  // return new Response(JSON.stringify(data), { status: 200, headers: { "Content-Type: "application/json; utf-8"}})
}

export default function App() {
  const { contacts, q } = useLoaderData();
  const [query, setQuery] = useState(q);
  const navigation = useNavigation();
  const submit = useSubmit();

  const searching = navigation.location && new URLSearchParams(navigation.location.search).has("q")

  function onConnectToTD(e) {
    window.location.href = 'https://auth.tdameritrade.com/auth?response_type=code&client_id=GGY2EMJ7SBKOCZAXKK3ULZBKMTSYZ4VC%40AMER.OAUTHAP&redirect_uri=https%3A%2F%2Fpegasus.cguirguis1.repl.co%2Ftdameritrade'
  }

  useEffect(() => {
    setQuery(q)
  }, [q])

  return (
    <>
      <div id="sidebar">
        <h1>Pegasus Dashboard</h1>
        <div>
          <Button variant="outline-primary" onClick={onConnectToTD}>Connect your account</Button>
        </div>
        <div>
          <Form id="search-form" role="search">
            <input
              id="q"
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
              onChange={(e) => { 
                const isFirstSearch = q === null
                submit(e.currentTarget.form, { replace: !isFirstSearch })
              }}
              className={searching ? "loading" : ""}
            />
            <div
              id="search-spinner"
              aria-hidden
              hidden={!searching}
            />
            <div
              className="sr-only"
              aria-live="polite"
            ></div>
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
        </div>
        {contacts.length ? (
          <ul>
            {contacts.map((contact) => (
              <li key={contact.id}>
                <NavLink 
                  to={`contacts/${contact.id}`}
                  className={({ isActive, isPending }) => 
                    isActive ? "active" : isPending ? "pending" : ""}>
                  {contact.first || contact.last ? (
                    <>
                      {contact.first} {contact.last}
                    </>
                  ) : (
                    <i>No Name</i>
                  )}{" "}
                  {contact.favorite && <span>★</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            <i>No contacts</i>
          </p>
        )}
      </div>
      <div 
        id="detail"
        className={
          navigation.state === "loading" ? "loading" : ""
        }>
        <Outlet />
      </div>
    </>
  );
}
