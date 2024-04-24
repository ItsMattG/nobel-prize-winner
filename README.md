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
- Local View on Desktop (Google Chrome):
![image](https://github.com/ItsMattG/nobel-prize-winner/assets/63543270/1703d3f6-d901-4262-88cc-06bf5610ccb6)
- Production View on Desktop (Google Chrome):
![image](https://github.com/ItsMattG/nobel-prize-winner/assets/63543270/ac9bd133-d5c7-463b-8b10-fc79016cc940)


### Screenshots: ###
![image](https://github.com/ItsMattG/nobel-prize-winner/assets/63543270/54822e07-5b46-4f4f-bd9d-73041ca9d1dc)
![image](https://github.com/ItsMattG/nobel-prize-winner/assets/63543270/36a7fbe0-7fda-4ea0-a0e4-4b5388bd2f5e)
![image](https://github.com/ItsMattG/nobel-prize-winner/assets/63543270/605ddda5-1bae-4026-95ab-db09c6e15b3c)
![image](https://github.com/ItsMattG/nobel-prize-winner/assets/63543270/d7046a2c-a093-4cfd-a518-f0f83e8f5816)
![image](https://github.com/ItsMattG/nobel-prize-winner/assets/63543270/cf4b7b5e-8535-4d36-9e7e-a2c16747587f)
![image](https://github.com/ItsMattG/nobel-prize-winner/assets/63543270/991d60ba-2245-434c-9363-3362d1b2f83a)

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

### Theme: ###
- Font and theme (colours) were inspired from the Mindset Health website.

### Recommended VS Code Extensions from Mantine: ###
- VS Code does not recognise postcss syntax by default so enable syntax highlighting and suppress variables ($variable) errors:
- PostCSS Intellisense and Highlighting by Vu Nguyen (https://marketplace.visualstudio.com/items?itemName=vunguyentuan.vscode-postcss)
- To get CSS variables autocomplete:
- CSS Variable Autocomplete by Vu Nguyen (https://marketplace.visualstudio.com/items?itemName=vunguyentuan.vscode-css-variables)
