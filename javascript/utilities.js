export function getSelectedDataSet(allDataSets) {
     // Get the selected dataset value from the dropdown
     const selectedDataSet = document.getElementById('indexSelection').value;
     var index = {};
     // Determine which dataset to use based on the selection     
     switch (selectedDataSet) {    
       case 'femaleIndex':
        index = allDataSets['femaleDataSet'];
         break;
       case 'maleIndex':
        index = allDataSets['maleDataSet'];
         break;
       case 'genderEqualityIndex':
        index = allDataSets['genderEqualityDataSet'];
         break;
       default:
         console.error('Selected dataset is not recognized.');
         return; // Exit the function if the selected dataset is not recognized
     }

     return index;
}