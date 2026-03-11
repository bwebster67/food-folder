
document.addEventListener('DOMContentLoaded', function() {

  var items = ["test1", "test2", "test3"];

  // connects to the itemList element
  const itemList = document.getElementById('itemList');

  for (const item of items) {

    // Creates the div
    const itemDiv = document.createElement('div');
    // Gives it a css class
    itemDiv.className = 'listItem'

    // Creates a checkbox
    const itemCheckbox = document.createElement('input')
    itemCheckbox.type = "checkbox"

    // Creates the name text
    const nameParagraph = document.createElement('p');
    // Gives it the content
    nameParagraph.textContent = `${item}`

    // Addes them to the hierarchy
    itemDiv.appendChild(itemCheckbox);
    itemDiv.appendChild(nameParagraph);
    itemList.appendChild(itemDiv);
  };

  function addItem(item) {
    items.addItem("item1")
  }

});
