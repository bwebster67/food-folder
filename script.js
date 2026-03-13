
// --- Supabase Setup ---
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://musdgyvvxpeztkbiysvl.supabase.co'; // Replace with yours
const supabasePublishableKey = 'sb_publishable_39OU95qed95crLf-0lcscw_ygv6BAbr'; // Replace with yours

// This 'supabase' variable is now your active connection to your database!
const supabase = createClient(supabaseUrl, supabasePublishableKey);
console.log("Supabase is loaded and connected!");

const loginSection = document.getElementById('loginSection');
const mainSection = document.getElementById('mainSection');

const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginButton');
const loginMessage = document.getElementById('loginMessage');
const logoutButton = document.getElementById('logoutButton');


// Check current session to maintain login
async function checkCurrentSession() {
  // Look for a saved session in the browser
  const { data: { session }, error } = await supabase.auth.getSession();

  if (session) {
    loginSection.style.display = 'none';
    mainSection.style.display = 'block';
    console.log("Welcome back:", session.user.email);

    const data = await fetchItems();
    createListUI(data);

  } else {
    // No saved session found.
    loginSection.style.display = 'block';
    mainSection.style.display = 'none';
    console.log("No user logged in.");
  }
}

// Login Button Click
loginButton.addEventListener('click', async () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  loginMessage.innerText = "Logging in...";

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    loginMessage.innerText = error.message;
  } else {
    loginMessage.innerText = "";
    emailInput.value = "";
    passwordInput.value = "";
    checkCurrentSession(); // Re-run the check to hide the login screen!
  }
});

// Logout Button Click 
logoutButton.addEventListener('click', async () => {
  await supabase.auth.signOut();
  checkCurrentSession();
});


// Run right as page loads
checkCurrentSession();


// Logic to write data
document.getElementById('writeDataButton').addEventListener('click', async () => {

  const newItem = {
    item_name: "test_item",
    item_qty: 0
  };

  const { data, error } = await supabase
    .from('Item')
    .insert([newItem])
    .select();

  if (error) {
    console.error("Error insterting data:", error.message);
  } else {
    console.log("Successfully added:", data);
  }

});


// Logic to read data
// fetches all items
async function readItems() {
  const { data, error } = await supabase
    .from("Item")
    .select()

  for (const item of data) {
    console.log(item.item_name)
  }

  if (error) {
    console.error("Error fetching data:", error.message);
  } else {
    console.log("Successfully fetched:", data);
  }
  return data;
}

async function fetchItems() {
  return readItems();
}


// Account Creation
// async function signUpUser() {
//   const { data, error } = await supabase.auth.signUp({
//     email: 'bkwebster@willamette.edu',
//     password: 'Fefe1234Alameda67!'
//   });
//
//   if (error) {
//     console.error("Sign up error:", error.message);
//   } else {
//     console.log("Account created! Check your email to verify (if enabled in Supabase settings).");
//   }
// }




function createListUI(data) {
  // connects to the itemList element
  const itemListElement = document.getElementById('itemList');

  // Clears existing content
  itemListElement.innerHTML = '';

  for (const item of data) {

    // Creates the div and assigns CSS class
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item'

    // Creates a checkbox
    const itemCheckbox = document.createElement('input')
    itemCheckbox.type = "checkbox"
    itemCheckbox.id = `checkbox ${item.item_id}`
    itemCheckbox.checked = item.is_checked;
    // --- NEW LOGIC: Listen for the user clicking the checkbox ---
    itemCheckbox.addEventListener('change', async (event) => {
      // Grabs current state of checkbox
      const newCheckedState = event.target.checked;

      // Send the update to Supabase
      const { error } = await supabase
        .from('Item')
        .update({ is_checked: newCheckedState })
        .eq('item_id', item.item_id); // The SQL 'WHERE' clause

      // On fail, send log and flip checkbox back to original state
      if (error) {
        console.error("Error updating item:", error.message);
        event.target.checked = !newCheckedState;
      } else {
        console.log(`Successfully updated ${item.item_name} to ${newCheckedState}`);
      }
    });
    // ------------------------------------------------------------

    // Creates the name text
    const nameParagraph = document.createElement('p');
    // Gives it the content
    nameParagraph.textContent = `${item.item_name}`

    // Addes them to the hierarchy
    itemDiv.appendChild(itemCheckbox);
    itemDiv.appendChild(nameParagraph);
    itemListElement.appendChild(itemDiv);
  };

}

