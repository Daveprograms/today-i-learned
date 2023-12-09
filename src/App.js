import { useEffect, useState } from "react";
import supabase from "./superbase";
import "./style.css";

function Counter({ emoji, counter, fact }) {
  const [count, setCount] = useState(counter);

  const IncreaseCounter = async () => {
    const updatedCounter = count + 1;
    const fieldToUpdate =
      emoji === "👍"
        ? "votesinteresting"
        : emoji === "🤯"
        ? "votesmindblowing"
        : "votesfalse";

    // Update the count in the database
    const { error } = await supabase
      .from("facts")
      .update({ [fieldToUpdate]: updatedCounter })
      .eq("id", fact.id)
      .select();

    if (!error) {
      setCount(updatedCounter);
    }
  };

  useEffect(() => {
    async function fetchFact() {
      const { data: fetchedFact, error } = await supabase
        .from("facts")
        .select("id")
        .eq("id", fact.id);
    }
    fetchFact();
  }, [fact.id]);

  return (
    <div className="fact-content">
      <button className="btn-large" onClick={IncreaseCounter}>
        <span style={{ fontSize: "20px" }}>{emoji}</span>
        {count}
      </button>
    </div>
  );
}

function App() {
  const [showForm, setShowForm] = useState(false);
  const [facts, setFacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  let [CurrentCategory, setCurrentCategory] = useState("");

  useEffect(
    function () {
      async function getFacts() {
        setIsLoading(true);

        if (CurrentCategory !== "all") {
          const { data: facts, error } = await supabase
            .from("facts")
            .select("*")
            .eq("Category", CurrentCategory)
            .order("votesinteresting", { ascending: false })
            .limit(1000);

          if (!error) setFacts(facts);
          else alert("There is a problem getting Data");
          setFacts(facts);
          setIsLoading(false);
        }
        if (CurrentCategory == "" || CurrentCategory == "all") {
          CurrentCategory = "all";
          const { data: facts, error } = await supabase
            .from("facts")
            .select("*")
            .order("votesinteresting", { ascending: false })
            .limit(1000);

          if (!error) setFacts(facts);
          else alert("There is a problem getting Data");
          setFacts(facts);
          setIsLoading(false);
        }
      }
      getFacts();
    },
    [CurrentCategory]
  );
  return (
    <>
      <Header showForm={showForm} setShowForm={setShowForm} />

      {showForm ? (
        <NewFactForm setFacts={setFacts} setShowForm={setShowForm} />
      ) : null}

      <main className="main">
        <CategoryFilter
          setCurrentCategory={setCurrentCategory}
          currentCategory={CurrentCategory}
        />
        {isLoading ? <Loader /> : <FactList facts={facts} />}
      </main>
    </>
  );
}

function Loader() {
  return <p className="message"> Loading....</p>;
}

function Header({ showForm, setShowForm }) {
  const appTitle = "Today i learned";

  return (
    <header className="header">
      <div className="logo">
        <img src="logo.png" height="68" width="68" alt="Today I learned logo" />
        <h1>{appTitle}</h1>
      </div>
      <button
        className="btn btn-large btn-open"
        onClick={() => setShowForm((show) => !show)}
      >
        {showForm ? "close" : "Share a fact"}
      </button>
    </header>
  );
}

const CATEGORIES = [
  { name: "technology", color: "#3b82f6" },
  { name: "science", color: "#16a34a" },
  { name: "finance", color: "#ef4444" },
  { name: "society", color: "#eab308" },
  { name: "entertainment", color: "#db2777" },
  { name: "health", color: "#14b8a6" },
  { name: "history", color: "#f97316" },
  { name: "news", color: "#8b5cf6" },
];

function isValidHttpUrl(string) {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
}

function NewFactForm({ setFacts, setShowForm }) {
  const [text, setText] = useState("");
  const [source, setSource] = useState("http://example.com");
  const [Category, setCategory] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const textLength = text.length;

  async function handleSubmit(e) {
    e.preventDefault();

    if (text && isValidHttpUrl(source) && Category && textLength <= 200) {
      const newFact = {
        text,
        source,
        Category,
        votesinteresting: 0,
        votesmindblowing: 0,
        votesfalse: 0,
      };
      setIsUploading(true);
      const { data: insertedFacts, error: insertError } = await supabase
        .from("facts")
        .insert(newFact)
        .select();
        setIsUploading(false);

      if (insertError) {
        console.error("Error inserting fact:", insertError);
        return;
      }

      if (insertedFacts && insertedFacts.length > 0) {
        const insertedFact = insertedFacts[0];
        setFacts((prevFacts) => [insertedFact, ...prevFacts]);
        setText("");
        setSource("");
        setCategory("");
        setShowForm(false);
      }
    }
  }

  return (
    <form className="fact-form" onSubmit={handleSubmit}>
      {" "}
      <input
        type="Text"
        placeholder="Share a fact with the world... "
        value={text}
        onChange={(e) => {
          setText(e.target.value);
        }}disabled={isUploading}
      />
      <span>{200 - textLength}</span>
      {/* <input value={source} type="text" */}
      <input
        value={source}
        type="text"
        placeholder="Trustworthy source..."
        onChange={(e) => setSource(e.target.value)}
        disabled={isUploading}
      />
      <select
        value={Category}
        onChange={(e) => setCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value=" ">Chose Category:</option>
        {CATEGORIES.map((cat) => (
          <option key={cat.name} value={cat.name}>
            {cat.name.toUpperCase()}
          </option>
        ))}
      </select>
      <button className="btn btn-large" disabled={isUploading}>
        Post
      </button>
    </form>
  );
}

function CategoryFilter({ setCurrentCategory, currentCategory }) {
  return (
    <aside>
      <ul>
        <li
          className={`category ${
            currentCategory === "all" ? "active-category" : ""
          }`}
        >
          <button
            className="btn btn-all-categories"
            onClick={() => setCurrentCategory("all")}
          >
            All
          </button>
        </li>
        {CATEGORIES.map((cat) => (
          <li
            key={cat.name}
            className={`category ${
              currentCategory === cat.name ? "active-category" : ""
            }`}
          >
            <button
              className="btn btn-category"
              style={{ backgroundColor: cat.color }}
              onClick={() => setCurrentCategory(cat.name)}
            >
              {cat.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function FactList({ facts }) {
  if (facts.length === 0) {
    return (
      <p className="message">
        {" "}
        No facts for this Category yet! Create the first one 🫡{" "}
      </p>
    );
  }
  return (
    <section>
      <ul className="facts-list">
        {facts.map((fact) => (
          <Fact key={fact.id} fact={fact} />
        ))}
      </ul>
      <p>There are {facts.length} facts in the database.Add your own!</p>
    </section>
  );
}

function Fact({ fact }) {

  
  return (
    <li className="fact">
      <p>
        {fact.text}
        <a className="source" href={fact.source} target="_blank">
          (Source)
        </a>
      </p>
      <span
        className="tag"
        style={{
          backgroundColor: CATEGORIES.find((cat) => cat.name === fact.Category)
            ?.color,
        }}
      >
        {fact.Category}
      </span>

      <div className="vote-buttons">
        <Counter emoji={"👍"} counter={fact.votesinteresting} fact={fact} />
        <Counter emoji={"🤯"} counter={fact.votesmindblowing} fact={fact} />
        <Counter emoji={"⛔️"} counter={fact.votesfalse} fact={fact} />
      </div>
    </li>
  );
}

export default App;
