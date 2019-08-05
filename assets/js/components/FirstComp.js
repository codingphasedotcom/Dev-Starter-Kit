import React, { Component } from 'react';
import ReactDOM from 'react-dom';

class Layout extends Component {
	constructor() {
		super();
		this.state = {
			name: 'Joe'
		};
	}
	clickedBtn = () => {};
	async test() {}
	render() {
		return (
			<div className="home">
				<div className="Aligner">
					<div className="Aligner-item">
						<img src="/img/logo.png" alt="codingphase logo" />
						<h1>Dev-Starter-Kit</h1>
						<div className="menu">
							<ul>
								<li>
									<a href="http://starterkit.codingphase.com" target="new">
										Documentation
									</a>
								</li>
								<li>
									<a href="http://www.codingphase.com" target="new">
										CodingPhase.Com
									</a>
								</li>
							</ul>
						</div>
						<div className="version-num">version 4.0.0</div>
					</div>
				</div>
			</div>
		);
	}
}

const app = document.getElementById('app');

ReactDOM.render(<Layout />, app);
