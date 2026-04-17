from pathlib import Path

import dash
from dash import dcc, html, Input, Output
import plotly.express as px
import pandas as pd

BASE_DIR = Path(__file__).resolve().parent

df = pd.read_csv(BASE_DIR / "AbsenteeSpreadsheetClean.csv")
app = dash.Dash(__name__)

app.layout = html.Div(
    className='dashboard-page',
    children=[
        html.H1(
            "Students With 15 Or More Absentees In A Single Year By State",
            style={'textAlign': 'center', 'marginBottom': '20px'},
        ),
        dcc.Dropdown(
            id='data-dropdown',
            options=[
                {'label': 'Total Absentee Students', 'value': 'Total Students'},
                {'label': 'American Indian or Alaska Native', 'value': 'American Indian or Alaska Native'},
                {'label': 'Hispanic or Latino of any race', 'value': 'Hispanic or Latino of any race'},
                {'label': 'Black or African American', 'value': 'Black or African American'},
                {'label': 'Native Hawaiian or Other Pacific Islander', 'value': 'Native Hawaiian or Other Pacific Islander'},
                {'label': 'Students With Disabilities Served Under IDEA', 'value': 'Students With Disabilities Served Under IDEA'},
                {'label': 'Students With Disabilities Served Only Under Section 504', 'value': 'Students With Disabilities Served Only Under Section 504'},
                {'label': 'English Language Learners', 'value': 'English Language Learners'},
                {'label': 'Students Per School', 'value': 'Students Per School'},
            ],
            value='Total Students',
            clearable=False,
            style={'width': 'min(24rem, 100%)', 'marginBottom': '20px'},
        ),
        html.Div(
            id='us-map-shell',
            className='map-shell',
            children=[
                html.Button(
                    'x',
                    id='minimize-map',
                    className='minimize-map',
                    title='Minimize expanded map',
                ),
                dcc.Graph(
                    id='us-map',
                    style={'width': '100%', 'height': '80vh', 'fontFamily': 'Newsreader'},
                ),
            ],
        ),
    ],
)


@app.callback(
    Output('us-map', 'figure'),
    Input('data-dropdown', 'value'),
)
def update_map(selected_data):
    fig = px.choropleth(
        df,
        locations="State Short",
        locationmode="USA-states",
        color=selected_data,
        color_continuous_scale='sunsetdark',
        hover_name="State",
        labels={selected_data: "Total Students"},
        scope="usa",
    )
    fig.update_traces(name="Students", selector=dict(type='choropleth'))
    return fig


server = app.server

if __name__ == '__main__':
    app.run(debug=True)
