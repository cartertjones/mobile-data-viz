(() => {
    class ReactDataTable extends React.Component {
        constructor(props) {
            super(props);
            this.originalData = props.originalData;
            this.state = {
                Region: '',
                minPopulation: '',
                maxPopulation: '',
                omitZeros: false,
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
                    const data = this.parseCSV(csvData);
                    console.log('Parsed data:', data);
                    this.setState({ originalData: data }, () => {
                        // Call sortData after setting the state to ensure it sorts the fetched data
                        this.sortData('Population high to low');
                        this.updateFormState({ searchQuery: ''});
                    });
                })
                .catch(error => {
                    console.error('Error fetching/parsing data:', error);
                });
        }
        // Updates state based on spec parameters
        updateFormState(specification) {
            const { sortOption, ...otherSpecs } = specification;
        
            if (sortOption) {
                this.sortData(sortOption);
            } else {
                this.setState(otherSpecs);
            }
        }
        // Sorts imported data based on current filter options
        sortData(sortOption) {
            const sorted = [...this.state.originalData].sort((a, b) => {
                if (sortOption === 'Population high to low') {
                    return b['pop'] - a['pop'];
                } else if (sortOption === 'Population low to high') {
                    return a['pop'] - b['pop'];
                } else if (sortOption === 'Total estimate high to low') {
                    return parseFloat(b['total_estimate']) - parseFloat(a['total_estimate']);
                } else if (sortOption === 'Total estimate low to high') {
                    return parseFloat(a['total_estimate']) - parseFloat(b['total_estimate']);
                }
                return 0;
            });
        
            this.setState({ originalData: sorted });
        }
        // Handles logic for sorting based on submitted population range
        filterByPopulationRange(minPop, maxPop) {
            const { omitZeros, originalData } = this.state;
            const filteredData = originalData.filter(row => {
                const population = parseInt(row['pop'], 10);
        
                // Check if any field in the row is zero or contains '*'
                let anyFieldIsZeroOrStar = false;
                for (const value of Object.values(row)) {
                    if (value !== undefined && (parseFloat(value) === 0 || value.includes('*'))) {
                        anyFieldIsZeroOrStar = true;
                        break;
                    }
                }
        
                if (omitZeros) {
                    return (!minPop || population >= minPop) && (!maxPop || population <= maxPop) && !anyFieldIsZeroOrStar;
                } else {
                    return (!minPop || population >= minPop) && (!maxPop || population <= maxPop) && !anyFieldIsZeroOrStar;
                }
            });
        
            this.setState({ originalData: filteredData, minPopulation: minPop, maxPopulation: maxPop });
        }        
        // Manually parses csv
        parseCSV(csvData) {
            const rows = csvData.split('\n');
            const headers = rows[0].split(',');

            const data = [];
            for (let i = 1; i < rows.length; i++) {
                const values = rows[i].split(',');
                const row = {};
                for (let j = 0; j < headers.length; j++) {
                    row[headers[j]] = values[j];
                }
                data.push(row);
            }

            return data;
        }
        //Page contents
        render() {
            let filteredData = this.state.originalData;

            if (!filteredData) {
                return (
                    <React.Fragment>
                        <LoadingMessage />
                    </React.Fragment>
                );
            }

            if (this.state.Region !== '') {
                filteredData = filteredData.filter(
                    (row) => row.Region === this.state.Region
                );
            }

            if (this.state.searchQuery !== '') {
                console.log('Before filtering:', filteredData);
                filteredData = filteredData.filter(
                    (row) => {
                        const includes = row.name.toLowerCase().includes(this.state.searchQuery);
                        console.log(`Checking ${row.name}: ${includes}`);
                        return includes;
                    }
                );
                console.log('After filtering:', filteredData);
            }

            return (
                <React.Fragment>
                    
                    <InfoParagraph />
                    
                    <hr />
                    <Filters
                        Region={this.state.Region}
                        updateFormState={this.updateFormState}
                        filterByPopulationRange={this.filterByPopulationRange.bind(this)}
                    />
                    
                    <hr />
                    
                    <DataTable
                        dataToDisplay={filteredData}
                    /> 
                </React.Fragment>
            );
        }
    }
    // Filter element logic
    const Filters = (props) => {
        // Updates state when region dropdown value changed
        let updateRegion = (clickEvent) => {
            props.updateFormState({
                Region: clickEvent.target.value,
            });
        }
        // Updates state when sort dropdown value changed
        let updateSort = (clickEvent) => {
            const sortOption = clickEvent.target.value;
            props.updateFormState({ sortOption });
        }        
        // Updates state when population range form submitted
        let updatePopulationRange = (submitEvent) => {
            submitEvent.preventDefault();
            const minPopulation = parseInt(submitEvent.target.minPopulation.value, 10);
            const maxPopulation = parseInt(submitEvent.target.maxPopulation.value, 10);
            console.log("Min: " + minPopulation + " Max: " + maxPopulation);
            props.updateFormState({ minPopulation, maxPopulation });
            props.filterByPopulationRange(minPopulation, maxPopulation);
        }
        // Updates state when text entered into country search bar
        let updateCountrySearch = (inputEvent) => {
            const searchQuery = inputEvent.target.value.toLowerCase();
            props.updateFormState({ searchQuery });
        }
        // Updates state when data gap checkbox clicked
        let updateZeroCheckbox = (changeEvent) => {
            const omitZeros = changeEvent.target.checked;
            props.updateFormState({ omitZeros });
            props.filterByPopulationRange(props.minPopulation, props.maxPopulation, omitZeros);
        }
        // Filter element JSX
        return (
            <React.Fragment>
                <div className='container'>
                    <div className='row'>
                        <div className='col-1'></div>
                        <div className='col-4'>
                        <label htmlFor="regionSelect">Region:</label>
                        <select id="regionSelect" onChange={updateRegion}>
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
                        </div>                
                        <div className='col-3'>
                            <label htmlFor="countrySearch">Search Country:&nbsp;</label>
                            <input type="text" id="countrySearch" onChange={updateCountrySearch}/>
                        </div>
                        <div className='col-2'>
                            <label htmlFor="zeroCheckbox">Omit Data Gaps:&nbsp;</label>
                            <input type="checkbox" id="zeroCheckbox" onChange={updateZeroCheckbox} />
                        </div>
                    </div>
                    <div className='row'>
                        <div className='col-1'></div>
                        <div className='col-3'>
                        <label htmlFor="populationSort">Sort Method:&nbsp;</label>
                        <select id="populationSort" onChange={updateSort}>
                            <option value="Population high to low">Population high to low</option>
                            <option value="Population low to high">Population low to high</option>
                            <option value="Total estimate high to low">Total estimate high to low</option>
                            <option value="Total estimate low to high">Total estimate low to high</option>
                        </select>
                        </div>
                        <div className='col-1'></div>
                        <div className='col-6'>
                            <label htmlFor="popRangeForm">Population Range:</label>
                            <form name="popRangeForm" onSubmit={updatePopulationRange}>
                                {/* <label htmlFor="minPopulation">Min:</label> */}
                                <input type="number" placeholder="Minimum" name="minPopulation"/>
                                <label htmlFor="maxPopulation">&nbsp;to&nbsp;</label>
                                <input type="number" placeholder="Maximum" name="maxPopulation"/>
                                <label htmlFor="popRangeSubmit">&nbsp;</label>
                                <button name="popRangeSubmit" type="submit">Apply</button>
                            </form>
                        </div>
                    </div>
                </div>
            </React.Fragment>
        )
    };
    // Contains useful information for the viewer above filters/data table
    const InfoParagraph = () => {
        return (
            <React.Fragment>
                <div className='container text-center'>
                    <p>
                        The data displayed on this page has been directly sourced from the 2021 UNEP Food Waste Index Report, which can be found{' '}
                        <a href="https://www.unep.org/resources/report/unep-food-waste-index-report-2021" target="_blank">here</a>.
                    </p>
                </div>
            </React.Fragment>
            )
    };
    // Displayed when originalData is null (during load usually)
    const LoadingMessage = () => {
        return (
            <React.Fragment>
                <div className='container'>
                    <p>Loading data...</p>
                </div>
            </React.Fragment>
        )
    }
    // Where imported data is displayed
    const DataTable = (props) => {
        const { dataToDisplay } = props;
        // Displayed if data is null or improper format
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
                            <th>Total estimate (tonnes/year)</th>
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
                                <td>{row['total_estimate']}</td>
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
    // Render
    const container = document.getElementById('react-data-table');
    const root = ReactDOM.createRoot(container);
    const reactDataTable = <ReactDataTable originalData={[]} />;
    root.render(reactDataTable);
})();
