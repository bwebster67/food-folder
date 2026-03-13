
// Supabase Setup -------------------------------------------------------------------
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://musdgyvvxpeztkbiysvl.supabase.co'; // Replace with yours
const supabasePublishableKey = 'sb_publishable_39OU95qed95crLf-0lcscw_ygv6BAbr'; // Replace with yours

// This 'supabase' variable is now your active connection to your database!
const supabase = createClient(supabaseUrl, supabasePublishableKey);
console.log("Supabase is loaded and connected!");

const loginSection = document.getElementById('loginSection');
const mainSection = document.getElementById('mainSection');
const listsSection = document.getElementById('listsSection');

const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginButton');
const loginMessage = document.getElementById('loginMessage');
const logoutButton = document.getElementById('logoutButton');
// -------------------------------------------------------------------



// Persistent Login Session -------------------------------------------------------------------
// Check current session to maintain login
async function checkCurrentSession() {
  // Look for a saved session in the browser
  const { data: { session }, error } = await supabase.auth.getSession();

  if (session) {
    loginSection.style.display = 'none';
    mainSection.style.display = 'block';
    console.log("Welcome back:", session.user.email);

    const { data, error } = await supabase
      .from("List")
      .select();

    // Clears existing content
    // listsSection.innerHTML = '';

    console.log("lists_data:", data);
    for (const list_data of data) {
      const list_id = list_data.list_id;
      console.log("list_id:", list_id);
      const data = await fetchItems(list_id);

      createListUI(data);
    }


  } else {
    // No saved session found.
    loginSection.style.display = 'block';
    mainSection.style.display = 'none';
    console.log("No user logged in.");
  }
}
// -------------------------------------------------------------------



// Login and Logout -------------------------------------------------------------------
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
    checkCurrentSession();
  }
});

// Logout Button Click 
logoutButton.addEventListener('click', async () => {
  await supabase.auth.signOut();
  checkCurrentSession();
});

// Run right as page loads
checkCurrentSession();
// -------------------------------------------------------------------



// -------------------------------------------------------------------
// Logic to write data
document.getElementById('writeDataButton').addEventListener('click', async () => {
  writeItem("4f53413d-7171-45d2-b066-0eca0f7e7afd", "test_item_in_list", 1);
});

async function writeItem(list_id = null, name, qty) {
  const newItem = {
    item_name: name,
    item_qty: qty
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

  if (list_id) {
    await addItemToList(list_id, data[0]);
  }

  checkCurrentSession();
}


async function addItemToList(list_id, newItemData) {

  const newListItem = {
    item_id: newItemData.item_id,
    list_id: list_id
  }

  const { data, error } = await supabase
    .from('ListItem')
    .insert([newListItem])
    .select();

  if (error) {
    console.error("Error adding item to list:", error.message);
  } else {
    console.log("Successfully added item to list:", data);
  }
}
// -------------------------------------------------------------------



// -------------------------------------------------------------------
// Logic to read data
// fetches all items
async function readItems(list_id = null) {

  console.log("reading items!");
  if (list_id != null) {
    //
    // implement lists-specific stuff here!!!!
    //
    console.log(`Fetching from ${list_id}`)
    const { data, error } = await supabase
      .from('List')
      .select
      (`
        list_id,
        list_name,
        ListItem 
          (
          Item 
            (
            item_id, 
            item_name, 
            is_checked, 
            item_qty
          )
        )
      `)
      .eq('list_id', list_id); // Basically a SQL 'WHERE' clause
    console.log(data[0])
    console.log(`${data[0].list_name}`);
    console.log(`${data[0]["ListItem"][0]}`);

    return data
  }

  else {


    const { data, error } = await supabase
      .from("Item")
      .select();

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
}


async function fetchItems(list_id = null) {
  return readItems(list_id);
}
// -------------------------------------------------------------------



// -------------------------------------------------------------------
function createListUI(data) {

  console.log(data);
  // connects to the itemList element

  const itemListElement = document.createElement('div')

  listsSection.appendChild(itemListElement);

  // Extract components of data
  const list_data = data[0];
  const items_data = data[0]["ListItem"];
  console.log("list_data: ", list_data);
  console.log("list_data.list_name: ", list_data.list_name);

  // TODO :
  // Creates list header
  const listHeader = document.createElement('h2');
  const list_name = list_data.list_name;
  const list_id = list_data.list_id;
  listHeader.textContent = list_name;
  listHeader.className = "listHeader";
  itemListElement.appendChild(listHeader);

  for (const item_data of items_data) {

    const item = item_data["Item"];
    console.log(item);

    // Creates the div and assigns CSS class
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';

    // Creates a checkbox
    const itemCheckbox = document.createElement('input');
    itemCheckbox.type = "checkbox";
    itemCheckbox.id = `checkbox ${item.item_id}`;
    itemCheckbox.checked = item.is_checked;

    // Update databse when checkbox is toggled 
    itemCheckbox.addEventListener('change', async (event) => {
      // Grabs current state of checkbox
      const newCheckedState = event.target.checked;

      // Send the update to Supabase
      const { error } = await supabase
        .from('Item')
        .update({ is_checked: newCheckedState })
        .eq('item_id', item.item_id); // Basically a SQL 'WHERE' clause

      // On fail, send log and flip checkbox back to original state
      if (error) {
        console.error("Error updating item:", error.message);
        event.target.checked = !newCheckedState;
      } else {
        console.log(`Successfully updated ${item.item_name} to ${newCheckedState}`);
      }
    });

    // Creates the name text
    const nameParagraph = document.createElement('p');
    // Gives it the content
    nameParagraph.textContent = `${item.item_name}`

    // Addes them to the hierarchy
    itemDiv.appendChild(itemCheckbox);
    itemDiv.appendChild(nameParagraph);
    itemListElement.appendChild(itemDiv);
  }

  // Section for adding a new item to a list
  const addItemDiv = document.createElement('div');
  const addItemButton = document.createElement('button');
  addItemButton.textContent = "Add Item";

  itemListElement.appendChild(addItemDiv);
  addItemDiv.appendChild(addItemButton);

  addItemButton.addEventListener('click', async () => {
    console.log("Adding item to", list_name);
    writeItem(list_id, "test_item_in_list", 1);
    // TODO: add a field so that you can add named items
  });


}
// -------------------------------------------------------------------

