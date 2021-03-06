import axios from 'axios';
import {promises as fs} from 'fs';
import React from 'react';
import {Helmet} from 'react-helmet';

class Application extends React.Component {
  render () {
    return (
        <div className="application">
            <Helmet>
                <style>{'body { background-color: red; }'}</style>
            </Helmet>
            ...
        </div>
    );
  }
};

export function removeFileExtension(fileName) {
  return fileName.substr(0, fileName.lastIndexOf('.'));
}

function removeUnknown(e) {
  return e !== 'Unknown';
}

export async function getStatesAndDistrictsFromAPI() {
  const stateDistrictWiseResponse = (
    await axios.get('https://api.covid19india.org/state_district_wise.json')
  ).data;
  const states = Object.keys(stateDistrictWiseResponse).filter(removeUnknown);
  const result = {};
  states.map((stateName) => {
    result[stateName] = Object.keys(
      stateDistrictWiseResponse[stateName]['districtData']
    ).filter(removeUnknown);
  });
  return result;
}

export async function getStatesAndDistrictsFromMaps() {
  const dir = await fs.opendir('public/maps');
  const districts = {};
  for await (const dirent of dir) {
    const fileName = dirent.name;
    const fileNameWithoutExtension = removeFileExtension(fileName);

    if (fileName === 'india.json') continue;
    const data = JSON.parse(
      await fs.readFile(`public/maps/${fileName}`, 'binary')
    );

    const stateName =
      data.objects[`${fileNameWithoutExtension}_district`].geometries[0]
        .properties.st_nm;

    const result = data.objects[
      `${fileNameWithoutExtension}_district`
    ].geometries.map((e) => e.properties.district);

    districts[stateName] = result;
  }
  return districts;
}
