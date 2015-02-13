/** @jsx React.DOM */

var React = require('react');
var Router = require('react-router');
var Route = Router.Route;
var Routes = Router.Routes;
var Redirect = Router.Redirect;
var Link = Router.Link;

var App = React.createClass({
    getInitialState: function() {
        return {data: []};
    },
    loadEquipos: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    handleJugadorSubmit: function(data) {
        $.ajax({
            url: this.props.url,
            data: data,
            success: function(data) {
                this.loadEquipos();
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    componentDidMount: function() {
        this.loadEquipos();
    },
    renderEquipos: function(){
        var items = this.state.data.map(function(item){
            return <Equipo obj={item}></Equipo>
        });
        return items;
    },
    render: function() {
        return (
            <div className="wrapper-equipos">
                {this.renderEquipos()}
            </div>
        );
    }
});

var Jugador = React.createClass({
    changeDetails: function(e){
        if (typeof this.props.clickHandler === 'function') {
            this.props.clickHandler(this.props.obj);
        }
    },
    render: function() {
        return (
            <li className="list-group-item" onClick={this.changeDetails}>{this.props.obj.name}</li>
        );
    }
});

var Equipo = React.createClass({
    getInitialState: function() {
        return {
            details: ''
        }
    },
    changeDetails: function(jugador){
        this.setState({
            details: 'El jugador ' + jugador.name + ' usa el número ' + jugador.number
        });
    },
    renderJugadores: function(){
        var items = this.props.obj.jugadores.map(function(item){
            return <Jugador obj={item} clickHandler={this.changeDetails}></Jugador>
        }.bind(this));
        return items;
    },
    render: function() {
        return (
            <div className="panel">
                <div className="panel-heading" style={{'background-color': this.props.obj.color }}>
                    <h3 className="panel-title">{this.props.obj.name}</h3>
                </div>
                <div className="panel-body">
                    <div className="col-md-6">
                        <ul className="list-group">
                            {this.renderJugadores()}
                        </ul>
                    </div>
                    <div className="col-md-6">
                        <p>{this.state.details}</p>
                    </div>
                </div>
            </div>
        );
    }
});

//var JugadorForm = React.createClass({
//    handleSubmit: function(e) {
//        e.preventDefault();
//        var name = this.refs.name.getDOMNode().value.trim();
//        var number = this.refs.number.getDOMNode().value.trim();
//        if (!name || !number) {
//            return;
//        }
//        if (typeof this.props.onSubmit === 'function') {
//            this.props.onSubmit(this.props.obj);
//        }
//        this.refs.name.getDOMNode().value = '';
//        this.refs.number.getDOMNode().value = '';
//    },
//    render: function() {
//        return (
//            <form>
//                <input type="text" placeholder="Nombre" ref="name"/>
//                <input type="text" placeholder="Número" ref="number"/>
//                <input type="submit" value="Post" />
//            </form>
//        );
//    }
//});

React.render(<App url="http://localhost:3000/api/equipos"></App>,document.getElementById('app-equipos'));


//var routes = (
//    <Route handler={App}>
//        <Route name="equipo" path="/equipos/:equipoId" handler={User}>
//            <Route name="jugador" path="jugadores/:jugadorId" handler={Task}/>
//            <Redirect from="todos/:taskId" to="task"/>
//        </Route>
//    </Route>
//);

//React.renderComponent(
//    <Routes children={routes}/>,
//    document.getElementById('app-equipos')
//);