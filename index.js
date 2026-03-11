
document.addEventListener('DOMContentLoaded', function() {

  var items = ["test1", "test2", "test3"];

  const itemList = document.getElementById('itemList');

  for (const item of items) {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'listItem'

    const nameParagraph = document.createElement('p');
    nameParagraph.textContent = `Name: ${item}`

    itemDiv.appendChild(nameParagraph);
    itemList.appendChild(itemDiv);
  };

  function addItem(item) {
    items.addItem("item1")
  }
});
