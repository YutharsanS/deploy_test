import { useState, useEffect } from 'react'
import Notification from './components/Notification';
import Note from './components/Note'
import noteService from './service/notes';
import './index.css';


const Footer = () => {
  const footerStyle = {
    color: 'green',
    fontStyle: 'italic',
    fontSize: 16
  }

  return (
    <div style={footerStyle}>
      <br />
      <em>Note app, Department of Computer Science, university of Helsinki 2024</em>
    </div>
  )
}



const App = () => {

  const [notes, setNotes] = useState(null);
  const [newNote, setNewNote] = useState('a new note...');
  const [showAll, setShowAll] = useState(true);
  const [errorMessage, setErrorMessage] = useState('some error happened')


  const hook = () => { // hook for the fetching and execution
    noteService
      .getAll()
      .then(initialNotes => {
        setNotes(initialNotes)
      })
  };

  useEffect(hook, []); // runs during the initial render

  if (!notes) {
    return null
  }

  const addNote = (event) => {
    event.preventDefault();
    const noteObject = {
      content: newNote,
      important: Math.random() < 0.5,
    }

    noteService.create(noteObject)
      .then(response => { // does the after things to the responses it got
        setNotes(notes.concat(response));
        setNewNote('');
      }).catch((error) => {
        console.log(error)
      })
  }

  const toggleImportance = (id) => {
    console.log('Importance of ' + id + ' needs to be toggled');

    const url = `http://localhost:3001/notes/${id}` // location of the file
    const note = notes.find(n => n.id === id); // finding the note in the array
    const changedNote = { ...note, important: !note.important }; // creating a new object with changed attribute

      noteService.update(id, changedNote) // replacing the object in the database
      .then(response => {
        // doing the after works after replacing
        setNotes(notes.map(
          (n) => {
            return (id === n.id ? response : n);
          }

        ));
      }).catch(error => {
        setErrorMessage(
          `Note '${note.content} was already removed from server`
        )
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
        setNotes(notes.filter(n => n.id !== id))
      })
  }

  const handleNoteChange = (event) => {
    setNewNote(event.target.value);
  }

  const notesToShow = showAll ? notes : notes.filter((note) => note.important === true)


  return (
    <div>
      <h1>Notes Deploy Test</h1>
      <Notification message={errorMessage} />
      <div>
        <button onClick={() => setShowAll(!showAll)} >
          show {showAll ? 'important' : 'all'}
        </button>
      </div>
      <ul>
        {notesToShow.map((note) =>
          <Note
            key={note.id}
            note={note}
            toggleImportance={() => toggleImportance(note.id)}
          />
        )}
      </ul>
      <form onSubmit={addNote}>
        <input
          value = {newNote}
          onChange={handleNoteChange}
        />
        <button type='submit'>submit</button>
      </form>
      <Footer/>
    </div>
  );
}

export default App
