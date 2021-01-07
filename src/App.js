import React, { useState, useEffect, useReducer } from "react"
import "./styles.css"
import axios from "axios"

const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      }
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      }
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      }
    default:
      throw new Error()
  }
}

const useDataApi = (initialUrl, initialData) => {
  const [url, setUrl] = useState(initialUrl)

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  })

  useEffect(() => {
    let didCancel = false

    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" })

      try {
        const result = await axios(url)

        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data })
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" })
        }
      }
    }

    fetchData()

    return () => {
      didCancel = true
    }
  }, [url])

  return [state, setUrl]
}

function App() {
  const articlesApi = (term) =>
    `https://hn.algolia.com/api/v1/search?query=${term}`

  const [query, setQuery] = useState("")

  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    articlesApi(query),
    {
      hits: []
    }
  )

  const validHits = data.hits.filter(
    (item) => item.title !== null && item.title !== ""
  )

  const handleSubmit = (event) => {
    event.preventDefault()

    doFetch(articlesApi(query))
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {isError && <div>Something went wrong ...</div>}

      {isLoading ? (
        <div>Loading ...</div>
      ) : (
        <ul>
          {validHits.map((item) => (
            <li key={item.objectID}>
              <a href={item.url}>{item.title}</a>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

export default App
