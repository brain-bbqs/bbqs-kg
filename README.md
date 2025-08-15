
## People of BBQS

The **People of BBQS** is a project that aims to gather the expertise of those involved in the BBQS initiative, along with the knowledge they wish to learn and share.  
Essentially, it seeks to collect and disseminate this knowledge to foster collaboration, skill development, and community growth.

The initial work began during the **BBQS Unconference**, an in-person event held from **15–17 July 2025**.  
During this event, we developed the **BBQS Bot**, which automatically triggers a form when a new member joins the channel to capture their expertise.

Currently, the form collects the following information:

- **What do you do?**
- **What knowledge would you like to share?**
- **What would you like to learn?**
- **What additional information would you like to share?**
- **Submitted By**
- **Timestamp**


The work has since been extended to include the following:

1. **Normalize** the Google Sheets data and save it in CSV format.
2. **Process** the input for questions such as *"What knowledge would you like to share?"* and perform concept mapping.  
   - For example, if someone responds with:  
     > neuroinformatics, machine learning, neuroimaging, signal processing, infrastructure  
     the system maps terms like *machine learning* to their corresponding concepts in relevant schemas and ontologies (if available).
3. **Save** the processed results (JSON + normalized CSV) in `data/sheets/` directory.

## Architecture

### Core pipeline
![](architecture.png)

### UI 
Contains the NextJS code for visualization.

## 🛠 How It Works?

1. **People of BBQS** submit updates via Slack.  
2. Data is stored in **Google Sheets**.  
3. **Google App Script** listens for changes and triggers **GitHub Actions**.  
4. `process_sheet_and_save.py`:
   - Reads sheet data.
   - Calls LLM for ontology mapping.
   - Stores outputs in **CSV** + **JSON** formats.  
5. Results are committed back to the **GitHub repository**.
6. Visualize the data in a user friendly manner.

## 💡 What’s New in This Release?

- **Automated Data Flow**: From Slack submissions to Google Sheets and Google Cloud processing.  
- **Ontology Mapping via AI**: Integrated OpenRouter LLM for automated concept alignment.  
- **GitHub Actions Integration**: Every sheet update triggers automated CSV + JSON-LD exports.  
- **Mapping Cache**: Faster re-processing without redundant LLM calls.    


## To-Do
- [ ] Refine concept mapping logic
- [ ] Improve prompt design and consistency
- [ ] Save processed results in JSON-LD format  


## License
- MIT
