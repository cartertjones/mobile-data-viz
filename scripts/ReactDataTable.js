(() => {
    class ReactDataTable extends React.Component {
        constructor(props) {
            super(props);
            this.originalData = props.originalData;
            this.state = {
                Region: ''
            };

            this.updateFormState = this.updateFormState.bind(this);
        }


        componentDidMount() {
            // Fetch CSV data here and update the state
            fetch("https://raw.githubusercontent.com/cartertjones/mobile-data-viz/production/data/merged_data.csv")
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Network response was not ok: ${response.status}`);
                    }
                    return response.text();
                })
                .then(csvData => {
                    // Parse CSV data manually
                    const jsonData = this.parseCSV(csvData);
                    console.log('Parsed data:', jsonData);
                    this.setState({ originalData: jsonData });
                })
                .catch(error => {
                    console.error('Error fetching/parsing data:', error);
                });
        }

        updateFormState(specification) {
            this.setState(specification);
        }

        parseCSV(csvData) {
            const rows = csvData.split('\n');
            const headers = rows[0].split(',');

            const jsonData = [];
            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(',');
                const row = {};
                for (let j = 0; j < headers.length; j++) {
                    row[headers[j]] = values[j];
                }
                jsonData.push(row);
            }

            return jsonData;
        }

        render() {
            let filteredData = this.state.originalData;

            if (this.state.Region !== '') {
                filteredData = filteredData.filter(
                    (row) => row.Region === this.state.Region
                );
            }

            return (
                <React.Fragment>
                    
                    <InfoParagraph />
                    
                    <hr />
                    <Filters
                        Region={this.state.Region}
                        updateFormState={this.updateFormState}
                    />
                    
                    <hr />
                    
                    <DataTable
                        dataToDisplay={filteredData}
                    /> 
                </React.Fragment>
            );
        }
    }

    const Filters = (props) => {
        let updateRegion = (clickEvent) => {
            props.updateFormState({
                Region: clickEvent.target.value,
            });
        }
        let updateSort = (clickEvent) => {
            const sortOption = clickEvent.target.value;
            this.sortData(sortOption);
        }

        let updatePopulationRange = (submitEvent) => {
            submitEvent.preventDefault();
            const minPopulation = submitEvent.target.minPopulation.value;
            const maxPopulation = submitEvent.target.maxPopulation.value;
            props.updateFormState({ minPopulation, maxPopulation });
        }

        return (
            <React.Fragment>
                <div className='container'>
                    <div className='row'>
                        <div className='col-md-3'>
                            <b>Region</b>
                        </div>
                        <div className='col-md-2'>
                            <select onChange={updateRegion}>
                            <option value="">All regions</option>
                            <option value="Australia and New Zealand">Australia and New Zealand</option>
                            <option value="Central Asia">Central Asia</option>
                            <option value="Eastern Asia">Eastern Asia</option>
                            <option value="Eastern Europe">Eastern Europe</option>
                            <option value="Latin America and the Caribbean">Latin America and the Caribbean</option>
                            <option value="Melanesia">Melanesia</option>
                            <option value="Micronesia">Micronesia</option>
                            <option value="Northern Africa">Northern Africa</option>
                            <option value="Northern America">Northern America</option>
                            <option value="Northern Europe">Northern Europe</option>
                            <option value="Polynesia">Polynesia</option>
                            <option value="South-eastern Asia">South-eastern Asia</option>
                            <option value="Southern Asia">Southern Asia</option>
                            <option value="Southern Europe">Southern Europe</option>
                            <option value="Sub-Saharan Africa">Sub-Saharan Africa</option>
                            <option value="Western Asia">Western Asia</option>
                            <option value="Western Europe">Western Europe</option>
                            </select>
                            <select onChange={updateSort}>
                                <option value="Population high to low">Population high to low</option>
                                <option value="Population low to high">Population low to high</option>
                            </select>
                        </div>
                        <div className='col-md-3'>
                            <form onSubmit={updatePopulationRange}>
                                <label htmlFor="minPopulation">Min Population:</label>
                                <input type="number" name="minPopulation" />
                                <label htmlFor="maxPopulation">Max Population:</label>
                                <input type="number" name="maxPopulation" />
                                <button type="submit">Apply</button>
                            </form>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    };

    const InfoParagraph = () => {
        return (
            <React.Fragment>
                <div className='container'>
                    <p><b><em>Sam 'BlondeBeard' Sanchez</em></b> was here. He didn't write the code though.</p>
                </div>
            </React.Fragment>
            )
    };

    const DataTable = (props) => {
        const { dataToDisplay } = props;
    
        if (!dataToDisplay || !Array.isArray(dataToDisplay)) {
            return (
                <div className="table-responsive">
                    <p>No data to display.</p>
                </div>
            );
        }
    
        console.log('Data to display:', dataToDisplay);
    
        return (
            <div className="table-responsive">
                <table className="table">
                    <tbody>
                        <tr>
                            <th>Region</th>
                            <th>Country</th>
                            <th>Population</th>
                            <th>Household estimate (kg/capita/year)</th>
                            <th>Household estimate (tonnes/year)</th>
                            <th>Food service estimate (kg/capita/year)</th>
                            <th>Food service estimate (tonnes/year)</th>
                            <th>Retail estimate (kg/capita/year)</th>
                            <th>Retail service estimate (tonnes/year)</th>
                        </tr>
                        {dataToDisplay.map((row, i) => (
                            <tr key={i}>
                                <td>{row['Region']}</td>
                                <td>{row['name']}</td>
                                <td>{row['pop']}</td>
                                <td>{row['household_estimate_pc']}</td>
                                <td>{row['household_estimate_t']}</td>
                                <td>{row['food_service_estimate_pc']}</td>
                                <td>{row['food_service_estimate_t']}</td>
                                <td>{row['retail_estimate_pc']}</td>
                                <td>{row['retail_estimate_t']}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    const container = document.getElementById('react-data-table');
    const root = ReactDOM.createRoot(container);
    root.render(<ReactDataTable originalData={[]} />);
})();
