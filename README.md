## View the web app here: ##
- https://nobel-prize-winner-cd8e8.web.app

## Features: ##
- Search list of Nobel Prize Winners

Filter by:
- Search Terms
- Category
- Organisations Only
- Category/Years where no one won
- From Year - To Year

Other features:
- Create a list of your favourite Nobel prize winners
- See a list of your search history with different filters
- Find more details on the Nobel Prize Winner
- Discover related Nobel Prize Winners
- Search is sorted by quality of match to the key terms

----------------------------------------------------------------------

### Note: ###
- It's optimised for mobile.
- There's a weird bug on the production site where the 'Related Nobel Prize Winners' div at the bottom of the details page is shifted to the left on desktop view - this div is centred on local.

### Considerations in scoping: ###
- React UI over customise styling to focus on showcasing other skills.
- Implementing third party search capabilities over creating own as there's many edge cases and takes time. Given the time constraints.
- Third party search cost money so implemented own small one (Algolia & Elastic required Firebase Blaze). Needed to implement searchTerm keywords less than 20k writes per day.

### Considerations regarding JSON data: ###
- Surname is sometimes ommitted, in some cases it's due to an organisation winning in others they don't have a surname.
- Removed cases of whitespace, and weird characters.
- Removed inconsistencies with fullstops and capitilisation.
- Converted share field from string to numeric.
- Added key-value pair isOrganisation to 32 elements as 32 didn't have surnames and of those 30 are organisation and wanted to distinguish.

### Recommended VS Code Extensions from Mantine: ###
- VS Code does not recognise postcss syntax by default so enable syntax highlighting and suppress variables ($variable) errors:
- PostCSS Intellisense and Highlighting by Vu Nguyen (https://marketplace.visualstudio.com/items?itemName=vunguyentuan.vscode-postcss)
- To get CSS variables autocomplete:
- CSS Variable Autocomplete by Vu Nguyen (https://marketplace.visualstudio.com/items?itemName=vunguyentuan.vscode-css-variables)
